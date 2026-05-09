import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { TransactionNode } from '../database/database.types';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { ProductStockEntity } from './entities/product-stock.entity';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum ProductStockRecordType {
  STOCK_IN = 'IN',
  STOCK_OUT = 'OUT',
}

registerEnumType(ProductStockRecordType, {
  name: 'ProductStockRecordType',
  description: 'Product stock record type',
});

@InputType()
export class ProductStockRecordInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ref?: string;

  @Field()
  @IsString()
  productId: string;

  @Field()
  @IsNumber()
  quantity: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedOrderId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  relatedProductId?: string;
}

@InputType()
export class ProductStockInInput extends ProductStockRecordInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  code?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  expireAt?: number;
}

export type ProductStockInArgs = (
  | {
      workspace: WorkspaceEntity;
    }
  | { member: WorkspaceMember }
) & {
  input: ProductStockInInput;
  node?: TransactionNode;
  ignoreEvent?: boolean;
};

@InputType()
export class ProductStockOutInput extends ProductStockRecordInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  stockId?: string;
}

export type ProductStockOutArgs = (
  | {
      workspace: WorkspaceEntity;
    }
  | { member: WorkspaceMember }
) & {
  input: ProductStockOutInput;
  workspaceBranchId?: string;
  node?: TransactionNode;
  onBeforeStart?: () => Promise<void>;
  onBeforeCommit?: () => Promise<void>;
};

@ObjectType()
export class ProductStock {
  @Field()
  quantity: number;

  @Field(() => [ProductStockEntity])
  stocks: ProductStockEntity[];
}

@InputType()
export class BulkProductsStockInInput {
  @Field(() => [ProductStockInInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductStockInInput)
  stocks: ProductStockInInput[];
}
