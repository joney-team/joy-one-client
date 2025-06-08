export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const currencies: Currency[] = [
  { code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates Dirham' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CFA', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CLP', symbol: 'CLP$', name: 'Chilean Peso' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'KOR', symbol: '₩', name: 'South Korean Won' },
  { code: 'KR', symbol: '₩', name: 'South Korean Won' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'MUR', symbol: 'Rs', name: 'Mauritian Rupee' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
  { code: 'PAN', symbol: 'B/.', name: 'Panamanian Balboa' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'USD', symbol: '$', name: 'United States Dollar' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
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
