import type { Page } from '@playwright/test';

// Matches any URL containing these substrings. Returns 204 so client-side code
// sees a successful response and doesn't retry.
const ANALYTICS_HOSTS = [
  'mixpanel.com',
  'google-analytics.com',
  'googletagmanager.com',
  'analytics.ahrefs.com',
];

export async function blockAnalytics(page: Page): Promise<void> {
  await page.route('**/*', route => {
    const url = route.request().url();
    if (ANALYTICS_HOSTS.some(host => url.includes(host))) {
      return route.fulfill({ status: 204, body: '' });
    }
    return route.continue();
  });
}
