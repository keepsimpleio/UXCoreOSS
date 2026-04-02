import * as fs from 'fs';
import * as path from 'path';

import {
  absoluteRoute,
  OutputPage,
  pickSeoDescription,
  STRAPI_BASE,
  strapiGet,
} from './generate-llms-shared';

const OUTPUT_DIR = process.env.LLMS_PAGES_DIR || 'uxcore_/llms-full-pages';

if (!STRAPI_BASE) {
  console.error('[error] STRAPI_URL or NEXT_PUBLIC_STRAPI must be set in .env');
  process.exit(1);
}

function routeSlug(route: string): string | null {
  const normalized = route.replace(/\/+$/, '');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || null;
}

function writeSlugMarkdownFiles(pages: OutputPage[], baseDir: string): void {
  for (const page of pages) {
    if (!page.slugSection) continue;
    const slug = routeSlug(page.route);
    if (!slug) continue;

    const sectionDir = path.join(baseDir, page.slugSection);
    fs.mkdirSync(sectionDir, { recursive: true });

    const content = [
      `# ${page.name}`,
      '',
      `- URL: ${absoluteRoute(page.route)}`,
      `- Description: ${page.seoDescription ?? ''}`,
      '',
    ].join('\n');

    fs.writeFileSync(path.join(sectionDir, `${slug}.md`), content, 'utf-8');
  }
}

async function fetchUxcoreSlugPages(): Promise<OutputPage[]> {
  try {
    const data = await strapiGet(
      'biases?locale=en&sort=number&pagination[pageSize]=1000&pagination[page]=1&populate[OGTags][populate]=ogImage',
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
          slugSection: 'uxcore' as const,
        };
      })
      .filter(Boolean) as OutputPage[];
  } catch (err) {
    console.log(
      `[pages] skipping uxcore slugs — fetch failed: ${(err as Error).message}`,
    );
    return [];
  }
}

async function fetchUxcgSlugPages(): Promise<OutputPage[]> {
  try {
    const data = await strapiGet(
      'questions?locale=en&sort=number&pagination[pageSize]=1000&pagination[page]=1&populate[OGTags][populate]=ogImage',
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
          slugSection: 'uxcg' as const,
        };
      })
      .filter(Boolean) as OutputPage[];
  } catch (err) {
    console.log(
      `[pages] skipping uxcg slugs — fetch failed: ${(err as Error).message}`,
    );
    return [];
  }
}

async function main(): Promise<void> {
  console.log('=== generate-llms-pages.ts ===\n');

  console.log('[step 1] Fetching all slug pages from Strapi...');
  const [uxcorePages, uxcgPages] = await Promise.all([
    fetchUxcoreSlugPages(),
    fetchUxcgSlugPages(),
  ]);

  const allPages = [...uxcorePages, ...uxcgPages];
  console.log(
    `         found ${uxcorePages.length} uxcore + ${uxcgPages.length} uxcg = ${allPages.length} total\n`,
  );

  console.log(`[step 2] Writing markdown files to public/${OUTPUT_DIR}...`);
  const baseDir = path.join(process.cwd(), 'public', OUTPUT_DIR);
  writeSlugMarkdownFiles(allPages, baseDir);

  console.log(
    `\nSuccessfully wrote ${allPages.length} page files to public/${OUTPUT_DIR}`,
  );
}

main().catch(err => {
  console.error('\n[error] generate-llms-pages failed:', err);
  process.exit(1);
});
