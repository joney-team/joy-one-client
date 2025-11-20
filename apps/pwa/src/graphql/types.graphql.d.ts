export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
};

export type AppConfig = {
  __typename?: 'AppConfig';
  UTC: Scalars['String']['output'];
  firebase: FirebaseClientConfig;
  metaAppId: Scalars['String']['output'];
  metaAppScope: Array<Scalars['String']['output']>;
  metaAppVersion: Scalars['String']['output'];
  name: Scalars['String']['output'];
  timeZone: Scalars['String']['output'];
  version: Scalars['String']['output'];
  workspaceDomainIP: Scalars['String']['output'];
  zaloAppId: Scalars['String']['output'];
};

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
export type CategoryEntity = {
  __typename?: 'CategoryEntity';
  _id: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  icon: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  parentId: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  thumbnail: Maybe<Scalars['String']['output']>;
  type: CategoryType;
};

/** Available category types */
export const CategoryType = {
  Common: 'COMMON',
  Posts: 'POSTS',
  Products: 'PRODUCTS'
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];
export type CustomFieldValue = {
  __typename?: 'CustomFieldValue';
  customFieldId: Scalars['String']['output'];
  value: Maybe<Scalars['JSONObject']['output']>;
};

export type CustomFieldValueInput = {
  customFieldId: Scalars['String']['input'];
  value?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type DeviceEntity = {
  __typename?: 'DeviceEntity';
  _id: Scalars['String']['output'];
  identifyId: Maybe<Scalars['String']['output']>;
  lastActiveAt: Scalars['Float']['output'];
  locale: Maybe<AppLocale>;
  notificationToken: Maybe<Scalars['String']['output']>;
  userAgent: Scalars['String']['output'];
  userId: Maybe<Scalars['String']['output']>;
};

export type FirebaseClientConfig = {
  __typename?: 'FirebaseClientConfig';
  apiKey: Scalars['String']['output'];
  appId: Scalars['String']['output'];
  authDomain: Scalars['String']['output'];
  measurementId: Scalars['String']['output'];
  messagingSenderId: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  storageBucket: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createProduct: Product;
  registerDevice: DeviceEntity;
};


export type MutationCreateProductArgs = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  combos?: InputMaybe<Array<ProductComboInput>>;
  combosExpireInDays?: InputMaybe<Scalars['Float']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  customFieldValues?: InputMaybe<Array<CustomFieldValueInput>>;
  defaultQtyPerUse?: InputMaybe<Scalars['Float']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  isHiddenInReceiptWhenNoPrice?: InputMaybe<Scalars['Boolean']['input']>;
  isStockCheck?: InputMaybe<Scalars['Boolean']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  productCode?: InputMaybe<Scalars['String']['input']>;
  supplies?: InputMaybe<Array<ProductSupplyInput>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  type: ProductType;
  unit: Scalars['String']['input'];
  voucherAmount?: InputMaybe<Scalars['Float']['input']>;
  voucherExcludeProductIds?: InputMaybe<Array<Scalars['String']['input']>>;
  voucherExpireInDays?: InputMaybe<Scalars['Float']['input']>;
  voucherIncludeProductIds?: InputMaybe<Array<Scalars['String']['input']>>;
  warningOutOfDateBeforeDays?: InputMaybe<Scalars['Float']['input']>;
  warningOutOfStockQty?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationRegisterDeviceArgs = {
  input: RegisterDeviceDto;
};

export type Product = {
  __typename?: 'Product';
  _id: Scalars['String']['output'];
  category: Maybe<CategoryEntity>;
  categoryId: Maybe<Scalars['String']['output']>;
  code: Maybe<Scalars['String']['output']>;
  combos: Maybe<Array<ProductCombo>>;
  combosExpireInDays: Maybe<Scalars['Float']['output']>;
  content: Maybe<Scalars['String']['output']>;
  defaultQtyPerUse: Maybe<Scalars['Float']['output']>;
  displayName: Maybe<Scalars['String']['output']>;
  image: Maybe<Scalars['String']['output']>;
  inStock: Maybe<Scalars['Float']['output']>;
  isHiddenInReceiptWhenNoPrice: Maybe<Scalars['Boolean']['output']>;
  isStockCheck: Maybe<Scalars['Boolean']['output']>;
  maxPrice: Maybe<Scalars['Float']['output']>;
  minPrice: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  productCode: Maybe<Scalars['String']['output']>;
  supplies: Maybe<Array<ProductSupply>>;
  tags: Array<Scalars['String']['output']>;
  type: ProductType;
  unit: Scalars['String']['output'];
  voucherAmount: Maybe<Scalars['Float']['output']>;
  voucherExcludeProductIds: Maybe<Array<Scalars['String']['output']>>;
  voucherExpireInDays: Maybe<Scalars['Float']['output']>;
  voucherIncludeProductIds: Maybe<Array<Scalars['String']['output']>>;
  warningOutOfDateBeforeDays: Maybe<Scalars['Float']['output']>;
  warningOutOfStockQty: Maybe<Scalars['Float']['output']>;
  workspaceId: Scalars['String']['output'];
};

export type ProductCombo = {
  __typename?: 'ProductCombo';
  productId: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
};

export type ProductComboInput = {
  productId: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
};

export type ProductSupply = {
  __typename?: 'ProductSupply';
  productId: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
};

export type ProductSupplyInput = {
  productId: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
};

/** Available product types */
export const ProductType = {
  Combo: 'COMBO',
  Product: 'PRODUCT',
  Service: 'SERVICE',
  Voucher: 'VOUCHER'
} as const;

export type ProductType = typeof ProductType[keyof typeof ProductType];
export type Query = {
  __typename?: 'Query';
  appConfig: AppConfig;
  getProductByIds: Array<Product>;
};


export type QueryGetProductByIdsArgs = {
  ids: Array<Scalars['String']['input']>;
};

export type RegisterDeviceDto = {
  identifyId: Scalars['String']['input'];
  locale?: InputMaybe<AppLocale>;
};

export type RelatedEntity = {
  __typename?: 'RelatedEntity';
  data: Maybe<Scalars['JSONObject']['output']>;
  entity: AppEntity;
  id: Maybe<Scalars['String']['output']>;
  index: Maybe<Scalars['Boolean']['output']>;
};

export type UserAuthProvider = {
  __typename?: 'UserAuthProvider';
  providerId: Scalars['String']['output'];
  uid: Scalars['String']['output'];
  username: Scalars['String']['output'];
};
