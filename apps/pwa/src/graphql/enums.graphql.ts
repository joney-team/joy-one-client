/** Available locales */
export const AppLocale = {
  En: 'EN',
  Vi: 'VI'
} as const;

export type AppLocale = typeof AppLocale[keyof typeof AppLocale];