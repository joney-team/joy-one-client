import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinTable, ManyToOne } from 'typeorm';
import { BasePostgresEntity } from '../../database/database.entities';
import { QuantityColumn } from '../../database/database.utils';
import { ProductEntity } from '../../products/entities/product.entity';
import { WorkspaceMemberPublicInfo } from '../../workspace-members/entities/workspace-member.entity';
import { ProductStockRecordType } from '../product-stocks.types';
import { ProductStockEntity } from './product-stock.entity';

@ObjectType('ProductStockRecord')
@Entity('product-stock-records')
export class ProductStockRecordEntity extends BasePostgresEntity {
  @Field({ nullable: true })
  @Column({ nullable: true })
  ref?: string;

  @Field({ nullable: true })
  stockCode?: string;

  @Field(() => ProductStockRecordType)
  @Column({ type: 'enum', enum: ProductStockRecordType })
  type: ProductStockRecordType;

  @Field()
  @QuantityColumn()
  quantity: number;

  @Field()
  @Column()
  productId: string;

  @Field(() => ProductEntity)
  product: ProductEntity;

  @Field()
  @Column()
  productStockId: string;

  @ManyToOne(() => ProductStockEntity, (stock) => stock.records, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  productStock: ProductStockEntity;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedProductId?: string;

  @Field(() => ProductEntity, { nullable: true })
  relatedProduct?: ProductEntity;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedOrderId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  note?: string;

  @Field(() => WorkspaceMemberPublicInfo, { nullable: true })
  createdByUser?: WorkspaceMemberPublicInfo;
}

export interface ProductStockRecordEntityBindData {
  stockCode?: string;
  product: ProductEntity;
  createdByUser: WorkspaceMemberPublicInfo;
  relatedProduct?: ProductEntity;
}
