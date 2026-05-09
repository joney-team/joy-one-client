import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import { BasePostgresEntity } from '../../database/database.entities';
import { QuantityColumn } from '../../database/database.utils';
import { GraphQLAnyType } from '../../graphql/graphql-type';
import { ProductEntity } from '../../products/entities/product.entity';
import { WorkspaceMemberPublicInfo } from '../../workspace-members/entities/workspace-member.entity';
import { ProductStockRecordEntity } from './product-stock-record.entity';

@ObjectType('ProductStock')
@Entity('product-stocks')
export class ProductStockEntity extends BasePostgresEntity {
  @Field({ nullable: true })
  @Column({ nullable: true })
  code?: string;

  @Field()
  @Column()
  productId: string;

  @Field(() => ProductEntity)
  product: ProductEntity;

  @Field()
  @QuantityColumn()
  quantity: number;

  @Field()
  @QuantityColumn()
  remainQuantity: number;

  @Field()
  @Column({ default: 0 })
  expireAt: number;

  @Field()
  @Column({ default: 0 })
  costPrice: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  note?: string;

  @Field(() => GraphQLAnyType)
  @OneToMany(() => ProductStockRecordEntity, (record) => record.productStock, {
    cascade: true,
  })
  records: ProductStockRecordEntity[];
}

export interface ProductStockEntityBindData {
  createdByUser: WorkspaceMemberPublicInfo;
  product: ProductEntity;
}
