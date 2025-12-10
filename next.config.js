/* eslint-disable @typescript-eslint/no-require-imports */
const dotenv = require('dotenv');
const path = require('path');
const { existsSync } = require('fs');

module.exports = async () => {
  const envFile = `.env.${process.env.APP_ENV || 'local'}`;
  const envPath = path.join(__dirname, envFile);
  const isLocal = process.env.NODE_ENV === 'development';

  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    console.error(`Env file not found: ${envPath}`);
  }

  return {
    i18n: {
      locales: ['en', 'ru', 'hy'],
      defaultLocale: 'en',
    },
    assetPrefix: isLocal ? '' : '/uxcore_next',
    async rewrites() {
      return [
        {
          source: '/assets/:path*',
          destination: '/uxcore_/assets/:path*',
        },
        {
          source: '/fonts/:path*',
          destination: '/uxcore_/fonts/:path*',
        },
        {
          source: '/audio/:path*',
          destination: '/uxcore_/audio/:path*',
        },
        {
          source: '/static/:path*',
          destination: '/uxcore_/static/:path*',
        },
        {
          source: '/robots.txt',
          destination: '/uxcore_/robots.txt',
        },
      ];
    },
    experimental: {
      manualClientBasePath: true,
    },
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
    compiler: {
      removeConsole:
        process.env.NODE_ENV === 'prod' ? { exclude: ['error'] } : false,
    },
    images: {
      domains: [
        'lh3.googleusercontent.com',
        'cdn.discordapp.com',
        'strapi.keepsimple.io',
        'staging-strapi.keepsimple.io',
      ],
    },
    productionBrowserSourceMaps: true,
  };
};
