import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectColumn } from 'src/database/database.utils';
import { Column, Entity } from 'typeorm';
import { BasePostgresEntity } from '../../database/database.entities';
import {
  ProductComboRef,
  ProductComboSourceType,
  ProductComboStatus,
} from '../product-combos.types';

@ObjectType('ProductCombo')
@Entity('product-combos')
export class ProductComboEntity extends BasePostgresEntity {
  @Field()
  @Column()
  productId: string;

  @Field()
  @Column()
  customerId: string;

  @ObjectColumn()
  productRefs: ProductComboRef[];

  @Field(() => ProductComboSourceType)
  @Column({
    type: 'enum',
    enum: ProductComboSourceType,
    default: ProductComboSourceType.ORDER,
  })
  sourceType: ProductComboSourceType;

  @Field()
  @Column()
  sourceId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  expireAt?: number;

  @Field(() => ProductComboStatus)
  @Column({
    type: 'enum',
    enum: ProductComboStatus,
    default: ProductComboStatus.ACTIVE,
  })
  status: ProductComboStatus;
}
