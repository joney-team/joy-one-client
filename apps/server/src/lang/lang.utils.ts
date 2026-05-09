import { Request } from 'express';
import { DateTime } from '../utils/date-time';
import { defaultLocale } from './lang.config';
import combinedDictionary from './lang.dictionary.json';
import { AppLocale, CombinedDictionary, Dictionary } from './lang.types';
import { DefaultTaskStatusId } from '../tasks/tasks.types';

export type LocaleContext = {
  locale?: AppLocale;
  currency?: string;
};

export function translate(
  key: string,
  context?: LocaleContext | AppLocale,
  params?: { [key: string]: string | number },
) {
  const currentLocale =
    (typeof context === 'string' ? context : context?.locale) ?? defaultLocale;

  let message = combinedDictionary[currentLocale][key] || key;

  if (params && typeof params === 'object') {
    Object.keys(params).map((param) => {
      switch (param) {
        case 'dateTime':
          message = message.replace(
            `{${param}}`,
            DateTime.format(params[param], { locale: currentLocale }),
          );
          break;
        case 'amount':
        case 'money':
          message = message.replace(
            `{${param}}`,
            (+params[param]).toLocaleString(currentLocale),
          );
          break;
        case 'taskStatus':
          const taskStatus = combinedDictionary[currentLocale][`task_status_${params[param]}`];
          if (taskStatus) {
            message = message.replace(`{${param}}`, taskStatus);
          } else {
            message = message.replace(
              `{${param}}`,
              params[param]?.toString() || '',
            );
          }

          break;
        case 'fromTaskStatus':
          const fromTaskStatus = combinedDictionary[currentLocale][`task_status_${params[param]}`];
          if (fromTaskStatus) {
            message = message.replace(`{${param}}`, fromTaskStatus);
          } else {
            message = message.replace(
              `{${param}}`,
              params[param]?.toString() || '',
            );
          }

          break;
        case 'toTaskStatus':
          const toTaskStatus = combinedDictionary[currentLocale][`task_status_${params[param]}`];
          if (toTaskStatus) {
            message = message.replace(`{${param}}`, toTaskStatus);
          } else {
            message = message.replace(
              `{${param}}`,
              params[param]?.toString() || '',
            );
          }

          break;
        default:
          message = message.replace(
            `{${param}}`,
            params[param]?.toString() || '',
          );
          break;
      }
    });
  }

  return message;
}

export function detectLanguage(request: Request) {
  const locales = request.headers['accept-language']?.split(';')[0].split(',');
  const locale = Object.values(AppLocale).find((locale) =>
    locales?.includes(locale),
  );
  return locale || AppLocale.en;
}

export function combineDictionary(dictionaries: Dictionary[]) {
  return dictionaries.reduce(
    (output, dic) => {
      Object.entries(dic.dictionary).map(([key, value]) => {
        const translateKey = dic.prefix ? `${dic.prefix}_${key}` : key;

        Object.entries(value).map(([locale, value]) => {
          output[locale][translateKey] = value;
        });
      });

      return output;
    },
    Object.values(AppLocale).reduce(
      (output, key) => ({ ...output, [key]: {} }),
      {} as CombinedDictionary,
    ),
  );
}
