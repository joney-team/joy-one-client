import { defaultDateFormats } from "@/configs/lang.config";
import { StorageKey } from "@/types";
import { isServer } from "@/utils/common.utils";
import { round } from "@/utils/number.utils";
import { t } from "@lingui/core/macro";
import { getCookie } from "cookies-next/client";
import dayjs from "dayjs";
import { getGlobal } from "../../global";
import { Dictionary, LangState, Locale, LocaleConfig } from "./lang-types";

export const getClientLocale = (): Locale => {
  let locale: Locale | undefined = undefined;

  try {
    // Fallback to cookie
    const cookieLocale = getCookie(StorageKey.LOCALE);
    if (cookieLocale && Object.values(Locale).includes(cookieLocale as Locale)) {
      locale = cookieLocale as Locale;
    }

    // Fallback to browser language
    if (!locale && typeof navigator !== "undefined" && navigator?.language) {
      navigator?.language.split("-").map((lang) => {
        if (Object.values(Locale).includes(lang as Locale)) {
          locale = lang as Locale;
        }
      });
    }
  } catch (error) {
    console.error(`Error getting locale: `, error);
  }

  return locale || Locale.EN;
};

export const getLocaleConfig = () => {
  if (isServer()) return {} as LocaleConfig;
  const global = getGlobal();
  return global._localeConfig || ({} as LocaleConfig);
};

export const hours = (seconds: number) => {
  const hours = Math.floor(seconds / 3600); // Tính số giờ
  const remainingSeconds = seconds % 3600;
  const minutes = remainingSeconds / 60; // Tính số phút còn lại

  // Tính tổng số giờ công dưới dạng số thập phân
  const workHours = hours + minutes / 60;
  return parseFloat(workHours.toFixed(2)); // Làm tròn tới 2 chữ số thập phân
};

export const numCurrencyRound = (value: number) => {
  try {
    const global = getGlobal();
    const settings = global._workspaceSettings;
    const currency = global._appConfig.currencies.find((c) => c.code === settings?.currencyCode);
    if (currency) return round(value, currency.roundPrecision);
    return value;
  } catch (error) {
    return value;
  }
};

export const num = (
  value: any,
  args?: {
    roundPrecision?: number;
    type?: "money" | "hours";
    suffix?: string;
    prefix?: string;
    empty?: string;
  }
): string => {
  let _args = { ...args };
  let roundPrecision = _args.roundPrecision;

  if (_args.type === "money" && !_args.suffix) {
    try {
      const global = getGlobal();
      const settings = global._workspaceSettings;
      const currency = global._appConfig.currencies.find((c) => c.code === settings?.currencyCode);
      if (currency) {
        _args.suffix = `${currency.symbol}`;
        roundPrecision = currency.roundPrecision;
      }
    } catch (error) {}
  }

  const render = () => {
    if (!value || typeof value !== "number" || Number.isNaN(+value) || +value === 0)
      return args?.empty || "0";
    let _value = value;
    if (typeof roundPrecision === "number") _value = round(+value, roundPrecision);
    else if (_args.type === "money") {
      if (typeof roundPrecision === "number") _value = round(+value, roundPrecision);
    } else if (_args.type === "hours") {
      const _val = hours(_value);
      if (_val === 1) return `${_val} ${t`hour`}`;
      return `${_val} ${t`hours`}`;
    }
    return (+_value).toLocaleString(getClientLocale());
  };

  return `${_args.prefix || ""}${render()}${_args.suffix || ""}`.trim();
};

export const isSeconds = (value: any) => {
  return typeof value === "number" && (+value).toString().length <= 10;
};

export const getTimeFormat = () => {
  const state = getLangState();
  return state.isTwelveHour ? "hh:mm A" : "HH:mm";
};

export const getDateFormat = () => {
  const state = getLangState();
  if (state.dateFormat === "auto") return defaultDateFormats[getClientLocale()];
  return state.dateFormat || defaultDateFormats[getClientLocale()];
};

export const getDateTimeFormat = () => {
  return `${getDateFormat()} ${getTimeFormat()}`;
};

export const localeNames = {
  [Locale.VI]: "Tiếng Việt",
  [Locale.EN]: "English",
};

export const translateNotification = (key: string, params?: any): string => {
  if (isServer()) return key;
  if (!key || typeof key !== "string") return "";

  const global = getGlobal();
  const dictionary: Dictionary = global._dictionary || {};

  let message = dictionary[key] || key;

  if (params && typeof params === "object") {
    Object.keys(params).map((param) => {
      switch (param) {
        case "dateTime":
          message = message.replace(`{${param}}`, renderDateTime(params[param], true));
          break;
        case "money":
          message = message.replace(`{${param}}`, num(params[param], { type: "money" }));
          break;
        case "amount":
          message = message.replace(`{${param}}`, num(params[param]));
          break;
        default:
          message = message.replace(`{${param}}`, params[param]);
          break;
      }
    });
  }

  return message;
};

export const getLangState = () => {
  if (isServer()) throw new Error("Lang state is not available on server");
  const global = getGlobal();
  return global._langState as LangState;
};

export const forceTime = (date: Date | number) => {
  if (typeof date === "number" && isSeconds(date)) {
    return new Date(date * 1000);
  }

  return new Date(date);
};

export const renderFromNow = (date: Date | number) => {
  const _date = dayjs(forceTime(date));
  const isTomorrow = _date.isSame(dayjs().add(1, "day"), "day");
  if (isTomorrow) return t`Tomorrow`;
  return _date.fromNow();
};

export const renderDateTime = (value: any, hideSeconds?: boolean) => {
  if (!value) return "";
  const _date = dayjs(forceTime(value));
  if (hideSeconds) return _date.format(getDateFormat());
  return _date.format(getDateTimeFormat());
};

export const renderDate = (value: any, args?: { hideYear?: boolean }) => {
  if (!value) return "";
  const isSecs = isSeconds(value);
  const _date = isSecs ? new Date(value * 1000) : new Date(value);
  let format = getDateTimeFormat();
  if (args?.hideYear) format = format.replace("/YYYY", "");
  return dayjs(_date).format(format.split(" ")[0]);
};

export const renderTime = (value: any) => {
  if (!value) return "";
  const _date = dayjs(forceTime(value));
  return _date.format(getTimeFormat());
};

export const renderRangeTime = (from: Date | number, to: Date | number) => {
  const state = getLangState();
  const fromDate = dayjs(forceTime(from));
  const toDate = dayjs(forceTime(to));

  if (state.isTwelveHour && fromDate.format("a") === toDate.format("a"))
    return `${fromDate.format("hh:mm")} - ${toDate.format("hh:mm A")}`;
  return `${renderTime(from)} - ${renderTime(to)}`;
};
