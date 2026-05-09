import { ObjectColumn } from 'src/database/database.utils';
import { Column, Entity, Unique } from 'typeorm';
import { ProductComboHistoryRecord } from '../product-combos.types';
import { BasePostgresEntity } from '../../database/database.entities';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ProductComboHistory')
@Entity('product-combo-history')
@Unique('product-combo-history-unique', ['ref'])
export class ProductComboHistoryEntity extends BasePostgresEntity {
  @Field()
  @Column()
  productComboId: string;

  @Field()
  @Column()
  ref: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  orderId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  note?: string;

  @Field(() => [ProductComboHistoryRecord], { nullable: true })
  @ObjectColumn({ nullable: true })
  used: ProductComboHistoryRecord[];

  @Field(() => [ProductComboHistoryRecord], { nullable: true })
  @ObjectColumn({ nullable: true })
  records: ProductComboHistoryRecord[];
}
