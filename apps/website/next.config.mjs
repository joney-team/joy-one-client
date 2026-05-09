/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["en", "vi"],
    defaultLocale: "en",
  },
  transpilePackages: ["@joy-one/config"],
  output: "standalone",
};

export default nextConfig;
