import type { FullConfig } from '@playwright/test';

// Pre-warm Next.js dev's per-route compile cache before the suite runs.
//
// `next dev` compiles dynamic routes on first hit. With Strapi-backed
// `getStaticProps` + `fallback: 'blocking'`, the first request to
// `/uxcore/[slug]` or `/uxcg/[slug]` can take 15-25s, which is close to
// Playwright's 30s navigation default. When a single test issues two cold
// gotos in sequence (see tests/p0/not-found.spec.ts), the second goto can
// be aborted by the runner before the response arrives, surfacing as a
// `null` Response.
//
// This setup hits each dynamic route once with a long client-side timeout,
// so by the time the test suite starts, both routes are warm. CI hits a
// prebuilt deployed URL where this isn't an issue, so we skip the warm-up
// when PLAYWRIGHT_NO_SERVER=1 is set.
async function globalSetup(config: FullConfig): Promise<void> {
  if (process.env.PLAYWRIGHT_NO_SERVER === '1') return;

  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3005';

  // Each path compiles a route module in dev that the suite later visits:
  //   - /uxcore/<typo>  → compiles /uxcore/[slug] (warms not-found.spec.ts)
  //   - /uxcg/<typo>    → compiles /uxcg/[slug]   (warms not-found.spec.ts)
  //   - /uxcp           → compiles /uxcp index    (warms uxcp-loads.spec.ts)
  //   - /uxcg/why-...   → compiles a real /uxcg/[slug] page including its
  //                       subresource chunks; this is the redirect destination
  //                       in numeric-slug-redirect.spec.ts and was the spec
  //                       hanging at context teardown when cold.
  const paths = [
    '/uxcore/this-slug-does-not-exist',
    '/uxcg/this-slug-does-not-exist',
    '/uxcp',
    '/uxcg/why-our-company-is-having-reputation-issue',
  ];

  for (const path of paths) {
    const url = `${baseURL}${path}`;
    const started = Date.now();
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(60_000),
        redirect: 'manual',
      });
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
       
      console.log(`  pre-warm ${path} → ${res.status} (${elapsed}s)`);
    } catch (err) {
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      // Don't fail the suite — log and let the actual tests surface a real
      // error. Dev server might still be starting up; tests will retry.
       
      console.warn(`  pre-warm ${path} failed after ${elapsed}s:`, err);
    }
  }
}

export default globalSetup;
