/** Available locales */
export const AppLocale = {
  En: 'EN',
  Vi: 'VI'
} as const;

export type AppLocale = typeof AppLocale[keyof typeof AppLocale];
/** Available category types */
export const CategoryType = {
  Common: 'COMMON',
  Posts: 'POSTS',
  Products: 'PRODUCTS'
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];
/** Available custom field types */
export const CustomFieldType = {
  Date: 'DATE',
  File: 'FILE',
  MultiSelect: 'MULTI_SELECT',
  Number: 'NUMBER',
  Select: 'SELECT',
  Switch: 'SWITCH',
  Text: 'TEXT',
  Textarea: 'TEXTAREA'
} as const;

export type CustomFieldType = typeof CustomFieldType[keyof typeof CustomFieldType];
/** Available file types */
export const FileType = {
  Audio: 'AUDIO',
  MsExcel: 'MS_EXCEL',
  MsPowerpoint: 'MS_POWERPOINT',
  MsWord: 'MS_WORD',
  Pdf: 'PDF',
  Photo: 'PHOTO',
  Unknown: 'UNKNOWN',
  Video: 'VIDEO'
} as const;

export type FileType = typeof FileType[keyof typeof FileType];
/** Available external storage providers */
export const PluginExternalStorageProvider = {
  AwsS3: 'AWS_S3'
} as const;

export type PluginExternalStorageProvider = typeof PluginExternalStorageProvider[keyof typeof PluginExternalStorageProvider];
/** Available product types */
export const ProductType = {
  Combo: 'COMBO',
  Product: 'PRODUCT',
  Service: 'SERVICE',
  Voucher: 'VOUCHER'
} as const;

export type ProductType = typeof ProductType[keyof typeof ProductType];