import { AppLocale } from "@/modules/lang/lang-types";

export const defaultDateFormats: { [key in AppLocale]: string } = {
  [AppLocale.VI]: "DD/MM/YYYY",
  [AppLocale.EN]: "MM/DD/YYYY",
};
