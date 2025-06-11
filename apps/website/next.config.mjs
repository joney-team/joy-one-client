/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'vi'],
    defaultLocale: 'en',
  },
  output: 'standalone',
};

export default nextConfig;
