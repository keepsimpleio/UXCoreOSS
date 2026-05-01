import { expect,test } from '../fixtures/test';
import { gotoSuccess } from '../helpers/goto';

// QA_PLAN §2 P0 #4 — /uxcg loads, H1 = "UX CORE GUIDE", at least one question is rendered.
// H1 from src/layouts/UXCGLayout/UXCGLayout.tsx:284.
// Questions are rendered by the Table component, each row carrying
// `data-cy="open-question"` (src/components/Table/Table.tsx:287). The plan's
// reference to `open-close-accordion-button` was incorrect — Accordion is not
// used on the UXCG landing page; the Table renders question rows directly.
test('@P0 @smoke /uxcg renders with H1 and at least one question', async ({
  page,
}) => {
  await gotoSuccess(page, '/uxcg');

  await expect(page.locator('h1')).toHaveText('UX CORE GUIDE');

  // Question rows carry `data-cy="open-question"` but the initial render hides
  // most of them (class `Table_Hidden`) until the user selects a stage tag.
  // Count-based structural assertion proves Strapi data loaded and the table
  // mounted, without depending on which rows are visually revealed.
  const questions = page.locator('[data-cy="open-question"]');
  expect(await questions.count()).toBeGreaterThan(0);
});
