export enum Locale {
  VI = 'vi',
  EN = 'en',
}

export type Dictionary = {
  [key: string]: string;
}

export type Dictionaries = {
  [key: string]: {
    [key in Locale]: string;
  }
}
