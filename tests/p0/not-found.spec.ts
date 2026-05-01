import { test } from '../fixtures/test';
import { gotoNotFound } from '../helpers/goto';

// QA_PLAN §2 P0 #5 — unknown URLs render the 404 page with HTTP 404.
//
// Phase 1 empirical check on dev (Next.js 15.0.5, this repo, 2026-04-24):
//   /this-route-does-not-exist         → HTTP 404 + "Keepsimple | Error Page"
//   /uxcore/this-slug-does-not-exist   → HTTP 404 + "Keepsimple | Error Page"
//   /uxcg/this-slug-does-not-exist     → HTTP 404 + "Keepsimple | Error Page"
// Clean HTTP 404s — the nested-dynamic-200-inline-404 regression seen on the
// sister project did NOT appear here. We still assert status AND title so any
// future regression toward that pattern trips the test.
// Helper: tests/helpers/goto.ts

test('@P0 @smoke unknown paths return HTTP 404 with the error page', async ({
  page,
}) => {
  // Top-level unknown path
  await gotoNotFound(page, '/this-route-does-not-exist');
  // Dynamic /uxcore/[slug] with a slug that has no bias
  await gotoNotFound(page, '/uxcore/this-slug-does-not-exist');
  // Dynamic /uxcg/[slug] with a slug that has no question
  await gotoNotFound(page, '/uxcg/this-slug-does-not-exist');
});
