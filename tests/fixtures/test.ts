import { expect,test as base } from '@playwright/test';

import { blockAnalytics } from './analytics-blocker';
import { silencePopups } from './popup-silencer';

type TestOptions = {
  // Set to false on tests that need to see the real cookie banner
  // (P2 cookie-consent tests). Default true for everything else.
  dismissCookieBanner: boolean;
};

export const test = base.extend<TestOptions>({
  dismissCookieBanner: [true, { option: true }],

  page: async ({ page, baseURL, dismissCookieBanner }, use) => {
    await blockAnalytics(page);
    await silencePopups(page);

    if (dismissCookieBanner && baseURL) {
      await page.context().addCookies([
        {
          name: 'cookieBoxIsSeen',
          value: 'true',
          url: baseURL,
        },
        {
          name: 'updateModalSeen',
          value: 'true',
          url: baseURL,
        },
      ]);
    }

    await use(page);
  },
});

export { expect };
