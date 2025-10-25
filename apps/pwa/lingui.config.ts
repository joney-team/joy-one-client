import { defineConfig } from "@lingui/cli";

export default defineConfig({
  locales: ["vi", "en"],
  pseudoLocale: "pseudo",
  sourceLocale: "en",
  fallbackLocales: {
    default: "en",
  },
  catalogs: [
    {
      path: "src/modules/lang/catalog/{locale}",
      include: ["src/"],
    },
  ],
});
