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

/** Available locales */
export const AppLocale = {
  En: 'EN',
  Vi: 'VI'
} as const;

export type AppLocale = typeof AppLocale[keyof typeof AppLocale];
export type DeviceEntity = {
  __typename?: 'DeviceEntity';
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
  registerDevice: DeviceEntity;
};


export type MutationRegisterDeviceArgs = {
  input: RegisterDeviceDto;
};

export type Query = {
  __typename?: 'Query';
  appConfig: AppConfig;
};

export type RegisterDeviceDto = {
  identifyId: Scalars['String']['input'];
  locale?: InputMaybe<AppLocale>;
};

export type UserAuthProvider = {
  __typename?: 'UserAuthProvider';
  providerId: Scalars['String']['output'];
  uid: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type UserSettings = {
  __typename?: 'UserSettings';
  isStartOfWeekSunday: Maybe<Scalars['Boolean']['output']>;
  isTwelveHour: Maybe<Scalars['Boolean']['output']>;
  locale: Maybe<AppLocale>;
  timezoneId: Maybe<Scalars['String']['output']>;
  timezoneUtc: Maybe<Scalars['String']['output']>;
};
