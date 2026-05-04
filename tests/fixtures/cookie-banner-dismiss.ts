import type { Page } from '@playwright/test';

// The cookie banner (src/components/Box) lacks a stable selector today — that
// is scheduled to be added on-touch during Phase 3. Until then, this helper
// pre-sets the cookie that gates the banner's visibility so it never renders.
// Dedicated cookie-consent tests (P2 #17, #18) use a clean context and skip
// this helper.
export async function dismissCookieBanner(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: 'cookieBoxIsSeen',
      value: 'true',
      url: page.url() || 'http://localhost:3005',
    },
  ]);
}
