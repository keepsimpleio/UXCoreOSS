import type { Page } from '@playwright/test';

// Timer-driven popups (feedback / pleaseShare / helpToHelp) pull their enabled
// flags from Strapi's /api/setting. Intercept that call and return all flags
// disabled + zero-second timers so no popup ever fires during a test run.
//
// Shape: getSettings() in src/api/strapi.ts:23 reads `data.data.attributes`,
// so the Strapi response is wrapped. Inner flags match `defaultSettings` in
// src/pages/_app.tsx:48-55.
const DISABLED_SETTINGS = {
  feedback: false,
  helpToHelp: false,
  pleaseShare: false,
  feedbackSeconds: 0,
  helpToHelpSeconds: 0,
  pleaseShareSeconds: 0,
};

export async function silencePopups(page: Page): Promise<void> {
  await page.route('**/api/setting**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { id: 1, attributes: DISABLED_SETTINGS },
      }),
    }),
  );
}

// Pre-set cookies that calm the UI: NewUpdateModal gates on `updateModalSeen`;
// the cookie consent banner hides when `cookieBoxIsSeen=true`. The
// cookie-consent tests in P2 use a clean context and skip this helper.
export async function seedCalmCookies(page: Page): Promise<void> {
  const url = new URL(page.url() || 'http://localhost');
  const domain = url.hostname;
  await page.context().addCookies([
    { name: 'cookieBoxIsSeen', value: 'true', domain, path: '/' },
    { name: 'updateModalSeen', value: 'true', domain, path: '/' },
  ]);
}
