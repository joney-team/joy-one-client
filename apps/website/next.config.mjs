/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["en", "vi"],
    defaultLocale: "en",
  },
  transpilePackages: ["@joy-one-client/config"],
  output: "standalone",
};

export default nextConfig;
