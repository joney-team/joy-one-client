import {
  ArgsType,
  Field,
  Int,
  InterfaceType,
  ObjectType,
} from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { AppEntity } from '../app.types';
import { GraphQLJSONObject } from 'src/graphql/graphql-type';
import { ProductType } from 'src/products/products.types';

@ArgsType()
export class SearchArgs {
  @Field(() => String)
  @IsString()
  query: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  limit?: number | null;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value && typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }

    return value;
  })
  @IsEnum(AppEntity, { each: true })
  entities: AppEntity[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  filter?: Record<string, any>;
}

export const searchResultTypes = {
  [AppEntity.CUSTOMERS]: () => SearchResultCustomer,
  [AppEntity.TASKS]: () => SearchResultTask,
  [AppEntity.PRODUCTS]: () => SearchResultProduct,
  [AppEntity.LOANS]: () => SearchResultLoan,
  [AppEntity.RECEIPTS]: () => SearchResultReceipt,
  [AppEntity.PARTNERS]: () => SearchResultPartner,
  [AppEntity.PRESCRIPTIONS]: () => SearchResultPrescriptions,
  [AppEntity.ORDERS]: () => SearchResultOrders,
  [AppEntity.TAGS]: () => SearchResultTags,
  [AppEntity.CATEGORIES]: () => SearchResultCategory,
  [AppEntity.WORKSPACE_MEMBERS]: () => SearchResultWorkspaceMember,
  [AppEntity.WORKSPACE_BRANCHES]: () => SearchResultWorkspaceBranch,
};

@InterfaceType({
  resolveType(value) {
    return searchResultTypes[value.entity]?.() ?? SearchResultBase;
  },
})
export abstract class SearchResult {
  @Field()
  id: string;

  @Field()
  entity: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultBase extends SearchResult {}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultOrders extends SearchResult {
  @Field()
  code: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultTags extends SearchResult {
  @Field()
  name: string;

  @Field()
  type: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultPrescriptions extends SearchResult {
  @Field()
  name: string;

  @Field()
  note: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultReceipt extends SearchResult {
  @Field()
  code: string;

  @Field()
  note: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultTask extends SearchResult {
  @Field()
  name: string;

  @Field()
  code: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultWorkspaceMember extends SearchResult {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  memberId?: string;

  @Field()
  userId: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultWorkspaceBranch extends SearchResult {
  @Field()
  name: string;

  @Field({ nullable: true })
  hotline?: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultCustomer extends SearchResult {
  @Field()
  name: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultProduct extends SearchResult {
  @Field(() => ProductType)
  type: ProductType;

  @Field()
  name: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  unit?: string;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  minPrice?: number;

  @Field({ nullable: true })
  maxPrice?: number;

  @Field({ nullable: true })
  defaultQtyPerUse?: number;

  @Field({ nullable: true })
  isHiddenInReceiptWhenNoPrice?: boolean;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultPartner extends SearchResult {
  @Field()
  name: string;

  @Field({ nullable: true })
  phone: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultCategory extends SearchResult {
  @Field()
  name: string;
}

@ObjectType({ implements: () => [SearchResult] })
export class SearchResultLoan extends SearchResult {
  @Field()
  code: string;

  @Field()
  customerName: string;

  @Field({ nullable: true })
  customerPhone?: string;

  @Field({ nullable: true })
  imeil?: string;

  @Field({ nullable: true })
  status?: string;
}
