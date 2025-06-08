import { AppCurrency } from "@/types";

export const currencies: AppCurrency[] = [
  { code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates Dirham', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'suffix' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', stepPrice: 0.001, roundPrecision: 3, symbolPosition: 'suffix' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'CFA', symbol: 'CFA', name: 'West African CFA Franc', stepPrice: 1, roundPrecision: 0, symbolPosition: 'suffix' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'suffix' },
  { code: 'CLP', symbol: 'CLP$', name: 'Chilean Peso', stepPrice: 1, roundPrecision: 0, symbolPosition: 'prefix' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'EUR', symbol: '€', name: 'Euro', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', stepPrice: 1, roundPrecision: 0, symbolPosition: 'prefix' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'KOR', symbol: '₩', name: 'South Korean Won', stepPrice: 1, roundPrecision: 0, symbolPosition: 'prefix' },
  { code: 'KR', symbol: '₩', name: 'South Korean Won', stepPrice: 1, roundPrecision: 0, symbolPosition: 'prefix' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', stepPrice: 1, roundPrecision: 0, symbolPosition: 'prefix' },
  { code: 'MUR', symbol: 'Rs', name: 'Mauritian Rupee', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', stepPrice: 0.001, roundPrecision: 3, symbolPosition: 'suffix' },
  { code: 'PAN', symbol: 'B/.', name: 'Panamanian Balboa', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'suffix' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'suffix' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'suffix' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', stepPrice: 1, roundPrecision: 0, symbolPosition: 'prefix' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', stepPrice: 1, roundPrecision: 0, symbolPosition: 'prefix' },
  { code: 'USD', symbol: '$', name: 'United States Dollar', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', stepPrice: 1000, roundPrecision: 0, symbolPosition: 'suffix' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', stepPrice: 0.01, roundPrecision: 2, symbolPosition: 'prefix' },
];

export function isCurrencySymbolPrefix(
  locale: string,
  currency: string,
): boolean {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    });

    const parts = formatter.formatToParts(123); // Example: $123.00 or 123,00 €

    const currencyIndex = parts.findIndex((p) => p.type === 'currency');
    const integerIndex = parts.findIndex((p) => p.type === 'integer');

    return currencyIndex < integerIndex;
  } catch {
    return true;
  }
}

export function getNumberSeparatorsByLocale(locale?: string): {
  decimalSymbol: string;
  thousandsSeparatorSymbol: string;
} {
  if (!locale) {
    return {
      decimalSymbol: '.',
      thousandsSeparatorSymbol: ',',
    };
  }

  const number = 1234567.89;
  const formatted = new Intl.NumberFormat(locale).format(number);

  const parts = formatted.match(/[\D]+/g);

  if (!parts || parts.length < 2) {
    return {
      decimalSymbol: '.',
      thousandsSeparatorSymbol: ',',
    };
  }

  return {
    thousandsSeparatorSymbol: parts[0],
    decimalSymbol: parts[0] === ',' ? '.' : ',',
  };
}
