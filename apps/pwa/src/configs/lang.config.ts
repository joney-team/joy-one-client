import { Locale } from "@/modules/lang/lang-types";

export const defaultDateFormats: { [key in Locale]: string } = {
  [Locale.VI]: 'DD/MM/YYYY',
  [Locale.EN]: 'MM/DD/YYYY',
}