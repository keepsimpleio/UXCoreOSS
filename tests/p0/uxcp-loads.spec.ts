import { expect,test } from '../fixtures/test';
import { gotoSuccess } from '../helpers/goto';

// QA_PLAN §2 P0 #3 — /uxcp loads, H1 = "UX CORE PERSONA", bias source table mounts.
// Selectors verified in src/layouts/UXCPLayout/UXCPLayout.tsx:445 (H1)
// and src/components/_uxcp/BiasActionCell/BiasActionCell.tsx:67 (row).
test('@P0 @smoke /uxcp renders with H1 and the bias source table', async ({
  page,
}) => {
  await gotoSuccess(page, '/uxcp');

  await expect(page.locator('h1')).toHaveText('UX CORE PERSONA');

  const biasRows = page.locator('[data-cy="uxcp-bias-action-cell"]');
  await expect(biasRows.first()).toBeVisible();
  expect(await biasRows.count()).toBeGreaterThan(0);
});
