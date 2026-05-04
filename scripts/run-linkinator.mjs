#!/usr/bin/env node
// Linkinator wrapper: drives linkinator's programmatic API so we can flush
// the JSON report incrementally and survive the Node 20 + linkinator 7.6.1
// unhandled DOMException ("This operation was aborted") that crashes the
// CLI when a fetch hits its abort timeout. The CLI loses everything on
// that crash — this wrapper writes after every link so partial results
// remain on disk.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LinkChecker } from 'linkinator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--')) || 'https://keepsimple.io';
const outArg = args.find(a => a.startsWith('--out='));
const configArg = args.find(a => a.startsWith('--config=')) || `--config=${path.join(ROOT, 'linkinator.config.json')}`;
const noWrite = args.includes('--no-write');

const today = new Date().toISOString().slice(0, 10);
const reportsDir = path.join(ROOT, 'reports');
if (!noWrite && !fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
const outPath = outArg ? outArg.slice(6) : path.join(reportsDir, `links-${today}.json`);
const configPath = configArg.slice(9);

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const links = [];
let lastFlush = 0;
let flushPending = false;

function snapshot(passed) {
  return JSON.stringify({ passed: passed ?? null, links }, null, 2);
}

function flush(passed) {
  if (noWrite) {
    flushPending = false;
    return;
  }
  try {
    fs.writeFileSync(outPath, snapshot(passed));
    lastFlush = Date.now();
    flushPending = false;
  } catch (err) {
    process.stderr.write(`flush failed: ${err.message}\n`);
  }
}

function scheduleFlush() {
  if (flushPending) return;
  if (Date.now() - lastFlush > 500) {
    flush();
    return;
  }
  flushPending = true;
  setTimeout(() => { if (flushPending) flush(); }, 500);
}

const checker = new LinkChecker();

checker.on('link', link => {
  links.push(link);
  const status = link.state === 'OK' ? 'ok' : link.state === 'SKIPPED' ? 'skip' : `BROKEN ${link.status ?? 'err'}`;
  process.stdout.write(`[${status}] ${link.url}\n`);
  scheduleFlush();
});

function bail(reason, err) {
  process.stderr.write(`\n${reason}: ${err?.message || err}\n`);
  if (err?.stack) process.stderr.write(`${err.stack}\n`);
  flush(false);
  process.stderr.write(noWrite
    ? `\nAborted after ${links.length} links (no JSON written, --no-write).\n`
    : `\nPartial results written to ${outPath} (${links.length} links).\n`);
  process.exit(2);
}

// Node 20 + linkinator 7.6.1: undici's AbortController surfaces as an
// unhandled TimeoutError/AbortError/DOMException emitted on a Readable
// stream when a request times out, killing the whole process. The link
// is already counted as BROKEN by linkinator's retry path, so swallow it.
const SWALLOW_NAMES = new Set(['AbortError', 'DOMException', 'TimeoutError']);

function maybeSwallow(label, err) {
  if (err && SWALLOW_NAMES.has(err.name)) {
    process.stderr.write(`(swallowed ${err.name} via ${label}: ${err.message})\n`);
    scheduleFlush();
    return true;
  }
  return false;
}

process.on('unhandledRejection', err => {
  if (maybeSwallow('unhandledRejection', err)) return;
  bail('unhandledRejection', err);
});

process.on('uncaughtException', err => {
  if (maybeSwallow('uncaughtException', err)) return;
  bail('uncaughtException', err);
});

process.on('SIGINT', () => bail('SIGINT', new Error('interrupted')));
process.on('SIGTERM', () => bail('SIGTERM', new Error('terminated')));

try {
  const result = await checker.check({ path: url, ...config });
  flush(result.passed);
  const broken = links.filter(l => l.state === 'BROKEN').length;
  const skipped = links.filter(l => l.state === 'SKIPPED').length;
  const ok = links.filter(l => l.state === 'OK').length;
  process.stdout.write(`\nDone. ${links.length} links checked (ok:${ok}, broken:${broken}, skipped:${skipped}).${noWrite ? '' : ` Report: ${outPath}`}\n`);
  process.exit(result.passed ? 0 : 1);
} catch (err) {
  bail('checker.check failed', err);
}
