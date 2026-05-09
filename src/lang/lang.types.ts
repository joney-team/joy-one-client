import { registerEnumType } from '@nestjs/graphql';
import { IsObject, IsOptional, IsString } from 'class-validator';

export enum AppLocale {
  vi = 'vi',
  en = 'en',
}

registerEnumType(AppLocale, {
  name: 'AppLocale',
  description: 'Available locales',
});

export type Dictionary<T extends string | number | symbol = string> = {
  prefix?: string;
  dictionary: {
    [key in T]: {
      [key in AppLocale]: string;
    };
  };
};

export type CombinedDictionary = {
  [locale in AppLocale]: {
    [key: string]: string;
  };
};

export class LangTranslateDto {
  @IsString()
  id: string;

  @IsObject()
  @IsOptional()
  params?: Record<string, string>;
}
