import { t } from "@lingui/core/macro";
import { AppLocale } from "./lang-types";

export const locales: Record<AppLocale, { name: () => string }> = {
  [AppLocale.VI]: { name: () => t`Vietnamese` },
  [AppLocale.EN]: { name: () => t`English` },
};
