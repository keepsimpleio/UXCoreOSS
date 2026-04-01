import * as dotenv from 'dotenv';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env'), override: true });
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true });

export const STRAPI_BASE =
  process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI || '';
export const SITE_BASE_URL = (process.env.NEXT_PUBLIC_DOMAIN || '').replace(
  /\/$/,
  '',
);

process.env.NEXT_PUBLIC_STRAPI = process.env.NEXT_PUBLIC_STRAPI || STRAPI_BASE;

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getJson(
  url: string,
  headers: Record<string, string> = {},
): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;
    const req = client.request(url, { method: 'GET', headers }, res => {
      const status = res.statusCode ?? 0;
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        raw += chunk;
      });
      res.on('end', () => {
        if (status < 200 || status >= 300) {
          reject(new Error(`HTTP ${status} for ${url}`));
          return;
        }
        try {
          resolve(JSON.parse(raw));
        } catch (err) {
          reject(
            new Error(
              `Invalid JSON for ${url}: ${(err as Error).message || 'unknown error'}`,
            ),
          );
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

export async function strapiGet(endpoint: string): Promise<any> {
  const url = `${STRAPI_BASE}/api/${endpoint}`;
  return getJson(url);
}

export function pickSeoDescription(attrs: any): string | null {
  const raw =
    attrs?.seoDescription ??
    attrs?.OGTags?.ogDescription ??
    attrs?.ogDescription ??
    null;
  return raw ? stripHtml(String(raw)) : null;
}

export function absoluteRoute(route: string): string {
  if (!SITE_BASE_URL) return route;
  if (route === '/') return SITE_BASE_URL;
  return `${SITE_BASE_URL}${route}`;
}

export interface OutputPage {
  route: string;
  name: string;
  seoDescription: string | null;
  slugSection?: 'uxcore' | 'uxcg';
}
