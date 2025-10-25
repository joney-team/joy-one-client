import { t } from "@lingui/core/macro";
import { Locale } from "./lang-types";

export const locales: Record<Locale, { name: () => string }> = {
  [Locale.VI]: { name: () => t`Vietnamese` },
  [Locale.EN]: { name: () => t`English` },
};
