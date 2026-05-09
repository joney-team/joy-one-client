import { Field, ObjectType } from '@nestjs/graphql';
import { CurrencyColumn, ObjectColumn } from 'src/database/database.utils';
import { Column, Entity, Unique } from 'typeorm';
import { CustomerEntity } from '../customers/customers.entity';
import { BasePostgresEntity } from '../database/database.entities';
import {
  OrderColumnItem,
  OrderDiscount,
  OrderPaymentStatus,
  OrderType,
} from './orders.types';

@ObjectType('Order')
@Entity('orders')
@Unique('orders-unique', ['code'])
export class OrderEntity extends BasePostgresEntity {
  @Field()
  @Column()
  code: string;

  @Field(() => OrderType, { nullable: true })
  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.COMMON,
    nullable: true,
  })
  type: OrderType;

  @ObjectColumn()
  items: OrderColumnItem[];

  @Field(() => OrderPaymentStatus)
  @Column({
    type: 'enum',
    enum: OrderPaymentStatus,
    default: OrderPaymentStatus.PROCESSING,
  })
  paymentStatus: OrderPaymentStatus;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array' })
  comboIds: string[];

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array', nullable: true })
  promotionIds: string[];

  @Field(() => [OrderDiscount])
  @ObjectColumn()
  discounts: OrderDiscount[];

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array' })
  assigneeUserIds: string[];

  @Field(() => Number)
  @CurrencyColumn()
  paidAmount: number;

  @Field(() => Number)
  @CurrencyColumn()
  totalAmount: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  note?: string;

  // Related entities
  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedCustomerId?: string;

  @Field(() => CustomerEntity, { nullable: true })
  relatedCustomer?: CustomerEntity;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array' })
  relatedUserIds: string[];

  @Field(() => Boolean, { nullable: true })
  @Column({ default: false })
  isFulfilled: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  tipAmount?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  directDiscount?: number;
}
