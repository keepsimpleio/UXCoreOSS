import * as fs from 'fs';
import * as path from 'path';

import { getLlmsMeta } from '../src/api/llmsMeta';
import {
  absoluteRoute,
  OutputPage,
  pickSeoDescription,
  STRAPI_BASE,
  strapiGet,
  stripHtml,
} from './generate-llms-shared';

const OUTPUT_FILENAME = process.env.LLMS_OUTPUT_FILE || 'uxcore_/llms.txt';
const DYNAMIC_SLUG_LIMIT = Number(process.env.LLMS_DYNAMIC_LIMIT || '10') || 10;

if (!STRAPI_BASE) {
  console.error('[error] STRAPI_URL or NEXT_PUBLIC_STRAPI must be set in .env');
  process.exit(1);
}

const PAGES_DIR = path.join(process.cwd(), 'src', 'pages');
const OUTPUT_FILE = path.join(process.cwd(), 'public', OUTPUT_FILENAME);

// ─────────────────────────────────────────────
// Step 1 — Site meta from /api/llms-meta
// ─────────────────────────────────────────────

async function fetchSiteMeta(): Promise<{
  title: string;
  description: string;
}> {
  try {
    const attrs = await getLlmsMeta();
    return {
      title: stripHtml(String(attrs?.title ?? 'UX Core')),
      description: stripHtml(String(attrs?.description ?? '')),
    };
  } catch (err) {
    try {
      const data = await strapiGet('llms-meta');
      const attrs = data?.data?.attributes ?? {};
      return {
        title: stripHtml(String(attrs?.title ?? 'UX Core')),
        description: stripHtml(String(attrs?.description ?? '')),
      };
    } catch {
      console.log(
        `[meta] /api/llms-meta not available — using defaults (${(err as Error).message})`,
      );
      return { title: 'UX Core', description: '' };
    }
  }
}

// ─────────────────────────────────────────────
// Step 2 — Scan src/pages/ recursively
// ─────────────────────────────────────────────

const PAGE_EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js']);
const EXCLUDED_FILENAMES = new Set(['404.tsx', '404.ts', '500.tsx', '500.ts']);

interface PageEntry {
  route: string;
  name: string;
  isDynamic: boolean;
}

/** Convert a path relative to src/pages into a URL route. */
function relPathToRoute(relPath: string): string {
  // Normalise separators
  let route = relPath.replace(/\\/g, '/');
  // Strip extension
  route = route.replace(/\.(tsx|ts|jsx|js)$/, '');
  // /blog/index → /blog, index (root) → ''
  route = route.replace(/\/index$/, '').replace(/^index$/, '');
  return '/' + route;
}

/** Derive a human-readable page name from the relative file path. */
function relPathToName(relPath: string): string {
  const noExt = relPath.replace(/\.(tsx|ts|jsx|js)$/, '');
  const segments = noExt.replace(/\\/g, '/').split('/');
  const last = segments[segments.length - 1];
  const base =
    last === 'index' ? (segments[segments.length - 2] ?? 'Home') : last;

  if (!base || base === '.') return 'Home';
  return base
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function scanPages(dir: string, base = ''): PageEntry[] {
  const entries: PageEntry[] = [];

  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const relPath = base ? `${base}/${item}` : item;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Exclude _private folders and the api/ folder
      if (item.startsWith('_') || item === 'api') continue;
      entries.push(...scanPages(fullPath, relPath));
    } else {
      const ext = path.extname(item);
      if (!PAGE_EXTENSIONS.has(ext)) continue;
      if (item.startsWith('_')) continue;
      if (EXCLUDED_FILENAMES.has(item)) continue;

      const route = relPathToRoute(relPath);
      const isDynamic = route.includes('[');
      entries.push({ route, name: relPathToName(relPath), isDynamic });
    }
  }

  return entries;
}

function normalizePageEntry(entry: PageEntry): PageEntry | null {
  if (entry.route === '/user/[userId]/[personaId]') return null;
  if (entry.route === '/uxcp/[name]/[hash]/[isTeamMember]') return null;
  if (entry.route === '/user/[userId]') {
    return {
      route: '/user/username',
      name: 'User Profile',
      isDynamic: false,
    };
  }
  return entry;
}

// ─────────────────────────────────────────────
// Step 3 — Per-page SEO description from Strapi
// ─────────────────────────────────────────────

// Maps a route prefix to the Strapi endpoint that holds its SEO data.
// Following the same naming convention as src/api/mainPageSeo.ts.
const SEO_ENDPOINT_MAP: Array<[prefix: string, endpoint: string]> = [
  ['/uxcg', 'uxcg-seo?locale=en&populate[OGTags][populate]=ogImage'],
  ['/uxcore-api', 'uxcore-api?locale=en&populate[OGTags][populate]=ogImage'],
  ['/uxcore', 'uxcore-seo?locale=en&populate[OGTags][populate]=ogImage'],
  ['/uxcp', 'uxcp-seo?locale=en&populate[OGTags][populate]=ogImage'],
];

function seoEndpointForRoute(route: string): string | null {
  for (const [prefix, endpoint] of SEO_ENDPOINT_MAP) {
    if (route === prefix || route.startsWith(prefix + '/')) {
      return endpoint;
    }
  }
  return null;
}

async function fetchPageSeoDescription(route: string): Promise<string | null> {
  const endpoint = seoEndpointForRoute(route);
  if (!endpoint) return null;

  try {
    const data = await strapiGet(endpoint);
    const attrs = data?.data?.attributes ?? data ?? {};
    const raw =
      attrs?.seoDescription ??
      attrs?.OGTags?.ogDescription ??
      attrs?.ogDescription ??
      null;
    return raw ? stripHtml(String(raw)) : null;
  } catch (err) {
    console.log(
      `[seo]  skipping ${route} — fetch failed: ${(err as Error).message}`,
    );
    return null;
  }
}

async function fetchTopUxcoreSlugPages(limit = 10): Promise<OutputPage[]> {
  try {
    const data = await strapiGet(
      `biases?locale=en&sort=number&pagination[pageSize]=${limit}&pagination[page]=1&populate[OGTags][populate]=ogImage`,
    );
    const items = Array.isArray(data?.data) ? data.data : [];
    return items
      .map((item: any) => {
        const attrs = item?.attributes ?? {};
        const slug = attrs?.slug;
        if (!slug) return null;
        return {
          route: `/uxcore/${slug}`,
          name: String(attrs?.title ?? `UXCore ${attrs?.number ?? slug}`),
          seoDescription: pickSeoDescription(attrs),
          slugSection: 'uxcore',
        };
      })
      .filter(Boolean) as OutputPage[];
  } catch (err) {
    console.log(
      `[seo]  skipping /uxcore/[slug] expansion — fetch failed: ${(err as Error).message}`,
    );
    return [];
  }
}

async function fetchTopUxcgSlugPages(limit = 10): Promise<OutputPage[]> {
  try {
    const data = await strapiGet(
      `questions?locale=en&sort=number&pagination[pageSize]=${limit}&pagination[page]=1&populate[OGTags][populate]=ogImage`,
    );
    const items = Array.isArray(data?.data) ? data.data : [];
    return items
      .map((item: any) => {
        const attrs = item?.attributes ?? {};
        const slug = attrs?.slug;
        if (!slug) return null;
        return {
          route: `/uxcg/${slug}`,
          name: String(attrs?.title ?? `UXCG ${attrs?.number ?? slug}`),
          seoDescription: pickSeoDescription(attrs),
          slugSection: 'uxcg',
        };
      })
      .filter(Boolean) as OutputPage[];
  } catch (err) {
    console.log(
      `[seo]  skipping /uxcg/[slug] expansion — fetch failed: ${(err as Error).message}`,
    );
    return [];
  }
}

async function fetchUxcatSeoDescription(): Promise<string | null> {
  try {
    const data = await strapiGet(
      'ux-cat?locale=en&populate[OGTags][populate]=ogImage',
    );
    const attrs = data?.data?.attributes ?? {};
    return pickSeoDescription(attrs);
  } catch (err) {
    console.log(
      `[seo]  skipping /uxcat description — fetch failed: ${(err as Error).message}`,
    );
    return null;
  }
}

// ─────────────────────────────────────────────
// Step 4 — Build and write /public/llms.txt
// ─────────────────────────────────────────────

function buildLlmsTxt(
  meta: { title: string; description: string },
  pages: OutputPage[],
): string {
  const lines: string[] = [];

  lines.push(`# ${meta.title}`);
  lines.push('');

  if (meta.description) {
    lines.push(`> ${meta.description}`);
    lines.push('');
  }

  lines.push('## Pages & Resources');
  lines.push('');

  for (const page of pages) {
    const suffix = page.seoDescription ? `: ${page.seoDescription}` : '';
    lines.push(`- [${page.name}](${absoluteRoute(page.route)})${suffix}`);
  }

  lines.push('');
  return lines.join('\n');
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('=== generate-llms.ts ===\n');

  // Step 1
  console.log('[step 1] Fetching site meta...');
  const meta = await fetchSiteMeta();
  console.log(`         title: "${meta.title}"\n`);

  // Step 2
  console.log('[step 2] Scanning src/pages...');
  const pageEntries = scanPages(PAGES_DIR);
  console.log(`         discovered ${pageEntries.length} routes\n`);

  // Step 3
  console.log('[step 3] Fetching per-page SEO descriptions...\n');
  const pages: OutputPage[] = [];
  const uxcatSeoDescription = await fetchUxcatSeoDescription();
  const [uxcoreSlugPages, uxcgSlugPages] = await Promise.all([
    fetchTopUxcoreSlugPages(DYNAMIC_SLUG_LIMIT),
    fetchTopUxcgSlugPages(DYNAMIC_SLUG_LIMIT),
  ]);

  for (const entry of pageEntries) {
    const normalizedEntry = normalizePageEntry(entry);
    if (!normalizedEntry) continue;

    if (normalizedEntry.route === '/uxcore/[slug]') {
      for (const page of uxcoreSlugPages) {
        if (page.seoDescription) {
          console.log(`  ✓  ${page.route} [expanded-dynamic]`);
        } else {
          console.log(
            `  –  ${page.route} [expanded-dynamic] (no SEO description — skipped)`,
          );
        }
        pages.push(page);
      }
      pages.push({
        name: 'See All UXCore',
        route: '/uxcore',
        seoDescription: await fetchPageSeoDescription('/uxcore'),
      });
      continue;
    }

    if (normalizedEntry.route === '/uxcg/[slug]') {
      for (const page of uxcgSlugPages) {
        if (page.seoDescription) {
          console.log(`  ✓  ${page.route} [expanded-dynamic]`);
        } else {
          console.log(
            `  –  ${page.route} [expanded-dynamic] (no SEO description — skipped)`,
          );
        }
        pages.push(page);
      }
      pages.push({
        name: 'See All UXCG',
        route: '/uxcg',
        seoDescription: await fetchPageSeoDescription('/uxcg'),
      });
      continue;
    }

    if (
      (normalizedEntry.route === '/uxcore' &&
        pages.some(page => page.name === 'See All UXCore')) ||
      (normalizedEntry.route === '/uxcg' &&
        pages.some(page => page.name === 'See All UXCG'))
    ) {
      continue;
    }

    const seoDescription = normalizedEntry.route.startsWith('/uxcat')
      ? uxcatSeoDescription
      : await fetchPageSeoDescription(normalizedEntry.route);

    const tag = normalizedEntry.isDynamic ? ' [dynamic]' : '';
    if (seoDescription) {
      console.log(`  ✓  ${normalizedEntry.route}${tag}`);
    } else {
      console.log(
        `  –  ${normalizedEntry.route}${tag} (no SEO description — skipped)`,
      );
    }
    pages.push({ ...normalizedEntry, seoDescription });
  }

  // Step 4
  console.log(`\n[step 4] Writing /public/${OUTPUT_FILENAME}...`);
  const content = buildLlmsTxt(meta, pages);

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');

  console.log(
    `\nSuccessfully mapped ${pages.length} routes to /public/${OUTPUT_FILENAME}`,
  );
}

main().catch(err => {
  console.error('\n[error] generate-llms failed:', err);
  process.exit(1);
});
