import { round } from "@/utils/number.utils";
import { AppCurrency } from "../../types";

export function reportConvertMoneyAmount(value: number, currency: AppCurrency) {
  if (!value || typeof value !== "number") return value;

  if (currency.code === "VND") {
    return round(value / 1000000, 1);
  }

  return value;
}

export function reportConvertMoneyAmountUnit(currency: AppCurrency) {
  if (currency.code === "VND") {
    return {
      short: "Tr",
      full: "Triệu đồng",
    };
  }

  return {
    short: currency.symbol,
    full: currency.symbol,
  };
}
