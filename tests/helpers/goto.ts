import { expect, type Page, type Response } from '@playwright/test';

// Empirical finding on this repo (Next.js 15.0.5 dev server, April 2026):
//   /uxcore/<typo-slug>  → HTTP 404 + 404 page rendered
//   /uxcg/<typo-slug>    → HTTP 404 + 404 page rendered
//   /<anything-else>     → HTTP 404
// Clean HTTP 404 — no 200-with-inline-404-content pattern seen on the sister
// project. So asserting status alone is reliable here.
//
// The 404 page sets `<title>Keepsimple | Error Page</title>`
// (src/pages/404.tsx:25), which is the tripwire for any future regression
// where a dynamic route starts rendering 404 content at HTTP 200.
export const NOT_FOUND_TITLE = 'Keepsimple | Error Page';

// Visit `path` and assert the response was a successful (non-404) page:
//   - HTTP status is 2xx (not 3xx/4xx/5xx)
//   - <title> is not the 404 page title
// Returns the navigation Response so callers can do further assertions.
//
// `waitUntil: 'domcontentloaded'` — we assert on rendered DOM (SSR'd content
// from getStaticProps), not on subresources finishing. In `next dev`, JS/CSS
// chunks compile on demand and the `load` event can fire many seconds after
// the page is interactable enough to assert on. Against a deployed build this
// behaves the same — DOMContentLoaded comes a few ms before load — so CI is
// unaffected. Auto-waiting Playwright assertions still catch render races.
export async function gotoSuccess(page: Page, path: string): Promise<Response> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).not.toBeNull();
  const status = response!.status();
  expect(
    status,
    `expected 2xx for ${path}, got ${status}`,
  ).toBeGreaterThanOrEqual(200);
  expect(status, `expected 2xx for ${path}, got ${status}`).toBeLessThan(300);
  await expect(page).not.toHaveTitle(NOT_FOUND_TITLE);
  return response!;
}

// Visit `path` and assert the app returned a 404 (status AND the 404 page
// title — belt-and-suspenders guard against a Next.js regression where
// dynamic routes return 200 with 404 content rendered inline).
export async function gotoNotFound(page: Page, path: string): Promise<void> {
  const response = await page.goto(path);
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `expected 404 for ${path}`).toBe(404);
  await expect(page).toHaveTitle(NOT_FOUND_TITLE);
}
