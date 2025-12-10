import { NextRequest, NextResponse } from 'next/server';
import { getRedirectMap } from './lib/getUXCoreRedirects';
import { getUXCGRedirects } from './lib/getUXCGRedirects';

const PUBLIC_FILE = /\.(.*)$/;
const supportedLocales = ['en', 'ru', 'hy'];
const defaultLocale = 'en';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skipping public files, _next, api, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  // Only using browser language on "/"
  if (pathname === '/') {
    const acceptLang = request.headers.get('accept-language');
    const preferredLocale = acceptLang
      ? acceptLang.split(',')[0].split('-')[0]
      : defaultLocale;

    const matchedLocale = supportedLocales.includes(preferredLocale)
      ? preferredLocale
      : defaultLocale;

    return NextResponse.redirect(new URL(`/${matchedLocale}`, request.url));
  }

  // All other paths: detect locale only from URL
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const hasLocalePrefix = supportedLocales.includes(maybeLocale);
  const locale = hasLocalePrefix ? maybeLocale : defaultLocale;

  const uxcoreIndex = hasLocalePrefix ? 1 : 0;
  const numberIndex = uxcoreIndex + 1;

  const section = segments[uxcoreIndex]; // either 'uxcore' or 'uxcg'
  const maybeId = segments[numberIndex];

  if (/^\d+$/.test(maybeId)) {
    if (section === 'uxcore') {
      const redirectMap = await getRedirectMap(locale);
      const slug = redirectMap[maybeId];

      if (slug) {
        const newUrl = request.nextUrl.clone();
        const localePrefix = hasLocalePrefix ? `/${locale}` : '';
        newUrl.pathname = `${localePrefix}/uxcore/${slug}`;
        return NextResponse.redirect(newUrl, 301);
      }
    }

    if (section === 'uxcg') {
      const redirectMap = await getUXCGRedirects(locale);
      const slug = redirectMap[maybeId];

      if (slug) {
        const newUrl = request.nextUrl.clone();
        const localePrefix = hasLocalePrefix ? `/${locale}` : '';
        newUrl.pathname = `${localePrefix}/uxcg/${slug}`;
        return NextResponse.redirect(newUrl, 301);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/uxcore/:path*',
    '/:locale/uxcore/:path*',
    '/uxcg/:path*',
    '/:locale/uxcg/:path*',
  ],
};
