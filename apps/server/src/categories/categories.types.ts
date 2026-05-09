import { registerEnumType } from '@nestjs/graphql';

export enum CategoryType {
  COMMON = 'COMMON',
  PRODUCTS = 'PRODUCTS',
  POSTS = 'POSTS',
}

registerEnumType(CategoryType, {
  name: 'CategoryType',
  description: 'Available category types',
});
