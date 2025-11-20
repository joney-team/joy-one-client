/** Available app entities */
export const AppEntity = {
  BankTransactions: 'BANK_TRANSACTIONS',
  Billings: 'BILLINGS',
  Categories: 'CATEGORIES',
  Comments: 'COMMENTS',
  Customers: 'CUSTOMERS',
  CustomerForms: 'CUSTOMER_FORMS',
  Loans: 'LOANS',
  Messages: 'MESSAGES',
  MessageBoxes: 'MESSAGE_BOXES',
  Orders: 'ORDERS',
  Partners: 'PARTNERS',
  Posts: 'POSTS',
  Prescriptions: 'PRESCRIPTIONS',
  Products: 'PRODUCTS',
  ProductVouchers: 'PRODUCT_VOUCHERS',
  Promotions: 'PROMOTIONS',
  Receipts: 'RECEIPTS',
  Tags: 'TAGS',
  Tasks: 'TASKS',
  Users: 'USERS',
  Workspaces: 'WORKSPACES',
  WorkspaceBranches: 'WORKSPACE_BRANCHES',
  WorkspaceMembers: 'WORKSPACE_MEMBERS'
} as const;

export type AppEntity = typeof AppEntity[keyof typeof AppEntity];
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
/** Available product types */
export const ProductType = {
  Combo: 'COMBO',
  Product: 'PRODUCT',
  Service: 'SERVICE',
  Voucher: 'VOUCHER'
} as const;

export type ProductType = typeof ProductType[keyof typeof ProductType];