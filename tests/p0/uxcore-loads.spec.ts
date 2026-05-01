import { expect,test } from '../fixtures/test';
import { gotoSuccess } from '../helpers/goto';

// QA_PLAN §2 P0 #2 — /uxcore loads, shows the 105-bias catalog, H1 reads "UX CORE".
// The default landing view is CoreViewLayout (src/layouts/CoreViewLayout/CoreViewLayout.tsx:133)
// whose H1 is "UX Core"; MobileView (src/components/_biases/MobileView/MobileView.tsx:281)
// also renders an H1 "UX CORE" that is hidden on desktop via CSS. Asserting against
// either text in a case-insensitive visible H1 is the structural invariant.
// Bias catalog is represented by ≥1 `[data-cy="search-result-item"]` on BiasLabel
// (src/components/_biases/BiasLabel/BiasLabel.tsx:94) — rendered in the default CoreView.
// `[data-cy="uxcore-folder-item"]` exists but is only shown in FolderView (alt layout).
test('@P0 @smoke /uxcore renders with H1 and the bias catalog', async ({
  page,
}) => {
  await gotoSuccess(page, '/uxcore');

  const h1 = page
    .locator('h1')
    .filter({ hasText: /^UX CORE$/i })
    .first();
  await expect(h1).toBeVisible();

  // Biases are rendered immediately (data-cy="search-result-item") but the
  // individual labels start with `data-state="faded"` and are revealed via
  // animation / hover. Count-based structural assertion is enough to prove
  // Strapi data loaded and the catalog mounted.
  const biasLabels = page.locator('[data-cy="search-result-item"]');
  expect(await biasLabels.count()).toBeGreaterThan(0);
});
