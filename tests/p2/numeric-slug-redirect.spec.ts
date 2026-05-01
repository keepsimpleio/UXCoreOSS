import { expect,test } from '../fixtures/test';

// QA_PLAN §2 P2 #32 — legacy numeric-slug redirect.
//
// This is a real user-facing feature: old URLs like /uxcore/1 and /uxcg/1
// must permanent-redirect to the current full-slug URL. The feature is
// implemented twice in the repo (middleware.ts:48 + getStaticProps
// duplicates in [slug].tsx), so either path satisfies the user's request.
//
// Canary numbers: #1 is stable in Strapi for both sections. The full slugs
// match the Cypress suite's long-standing canaries:
//   - /uxcore/1 → /uxcore/1-availability-heuristics
//     (cypress/e2e/uxcore/bias-modal.cy.ts:4)
//   - /uxcg/1 → /uxcg/why-our-company-is-having-reputation-issue
//     (cypress/e2e/uxcg/uxcg-modal.cy.ts:5)
//
// Playwright follows redirects by default. We don't assert the exact
// HTTP status on the redirect hop (middleware codes 301, getStaticProps
// yields 308 — both are "permanent"); we assert the final landed URL and
// that the page rendered content, not the 404.

test('@P2 /uxcore/<number> redirects to the full bias slug', async ({
  page,
}) => {
  const response = await page.goto('/uxcore/1');
  expect(response, 'no response for /uxcore/1').not.toBeNull();

  await expect(page).toHaveURL(/\/uxcore\/1-availability-heuristics\/?$/);
  expect(response!.status()).toBeGreaterThanOrEqual(200);
  expect(response!.status()).toBeLessThan(300);

  // Structural: the destination page rendered an H1 (the slug page's title).
  // Don't require `toBeVisible` — these pages open in a modal/overlay context
  // where the H1 can be in the DOM but visually offscreen until scroll.
  expect(await page.locator('h1').count()).toBeGreaterThan(0);
});

test('@P2 /uxcg/<number> redirects to the full question slug', async ({
  page,
}) => {
  const response = await page.goto('/uxcg/1');
  expect(response, 'no response for /uxcg/1').not.toBeNull();

  await expect(page).toHaveURL(
    /\/uxcg\/why-our-company-is-having-reputation-issue\/?$/,
  );
  expect(response!.status()).toBeGreaterThanOrEqual(200);
  expect(response!.status()).toBeLessThan(300);

  // Structural: the destination page rendered an H1 (the slug page's title).
  // Don't require `toBeVisible` — these pages open in a modal/overlay context
  // where the H1 can be in the DOM but visually offscreen until scroll.
  expect(await page.locator('h1').count()).toBeGreaterThan(0);
});
