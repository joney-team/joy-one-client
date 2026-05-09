import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { CustomFieldValue } from '../../custom-fields/custom-fields.types';
import { ProductStock } from '../../product-stocks/product-stocks.types';
import {
  ProductComboValue,
  ProductSupply,
  ProductType,
} from '../products.types';

@ObjectType('Product')
@Entity('products')
export class ProductEntity extends BaseMongoEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column()
  code?: string;

  @Field(() => String, { nullable: true })
  @Column()
  content?: string;

  @Field(() => String, { nullable: true })
  @Column()
  displayName?: string;

  @Field(() => String, { nullable: true })
  @Column()
  image?: string;

  @Field(() => String, { nullable: true })
  @Column()
  productCode?: string;

  @Field(() => [String])
  @Column()
  tags: string[];

  @Field(() => [ProductSupply], { nullable: true })
  @Column()
  supplies?: ProductSupply[];

  @Field(() => String)
  @Column()
  unit: string;

  @Field(() => Number)
  @Column()
  price: number;

  @Field(() => Number, { nullable: true })
  @Column()
  minPrice?: number;

  @Field(() => Number, { nullable: true })
  @Column()
  maxPrice?: number;

  @Field(() => Number, { nullable: true })
  @Column()
  defaultQtyPerUse?: number;

  @Field(() => Boolean, { nullable: true })
  @Column()
  isStockCheck?: boolean;

  @Field(() => Number, { nullable: true })
  @Column()
  warningOutOfDateBeforeDays?: number;

  @Field(() => Number, { nullable: true })
  @Column()
  warningOutOfStockQty?: number;

  @Field(() => String, { nullable: true })
  @Column()
  categoryId?: string;

  @Field(() => Number, { nullable: true })
  @Column()
  inStock?: number;

  @Field(() => Boolean, { nullable: true })
  @Column()
  isHiddenInReceiptWhenNoPrice?: boolean;

  @Field(() => ProductType)
  @Column()
  type: ProductType;

  // ======================= Start combo related =======================
  // @Field(() => [ProductComboValue], { nullable: true })
  @Column()
  combos?: ProductComboValue[];

  @Field(() => Number, { nullable: true })
  @Column()
  combosExpireInDays?: number;
  // ======================= End combo related =======================

  // ======================= Start voucher related =======================
  @Field(() => Number, { nullable: true })
  @Column()
  voucherAmount?: number;

  @Field(() => Number, { nullable: true })
  @Column()
  voucherExpireInDays?: number;

  @Field(() => [String], { nullable: true })
  @Column()
  voucherExcludeProductIds?: string[];

  @Field(() => [String], { nullable: true })
  @Column()
  voucherIncludeProductIds?: string[];
  // ======================= End voucher related =======================
}

export interface ProductEntityBindData {
  category: CategoryEntity;
  combos: { productId: string; product: ProductEntity; quantity: number }[];
  voucherExcludeProducts: ProductEntity[];
  voucherIncludeProducts: ProductEntity[];
  stock: ProductStock;
  supplies: (ProductSupply & { product: ProductEntity })[];
  customFields: CustomFieldValue[];
}

@ObjectType()
export class ProductStockResult {
  @Field()
  quantity: number;
}

@ObjectType()
export class ProductComboResult {
  @Field()
  productId: string;

  @Field()
  quantity: number;

  @Field()
  product: ProductEntity;
}

@ObjectType()
export class ProductSupplyResult extends ProductSupply {
  @Field(() => ProductEntity)
  product: ProductEntity;
}
