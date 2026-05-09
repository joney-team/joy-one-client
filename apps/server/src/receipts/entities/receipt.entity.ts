import { Field, ObjectType } from '@nestjs/graphql';
import { CurrencyColumn } from 'src/database/database.utils';
import { Column, Entity, Unique } from 'typeorm';
import { CustomerEntity } from '../../customers/customers.entity';
import { BasePostgresEntity } from '../../database/database.entities';
import { GraphQLAnyType, GraphQLJSONObject } from '../../graphql/graphql-type';
import {
  ReceiptDataChanged,
  ReceiptPaymentMethod,
  ReceiptStatus,
  ReceiptType,
} from '../receipts.types';

@ObjectType('Receipt')
@Entity('receipts')
@Unique('receipts-unique', ['code'])
export class ReceiptEntity<T = any> extends BasePostgresEntity {
  @Field()
  @Column()
  code: string;

  @Field()
  @Column()
  ref: string;

  @Field(() => ReceiptType)
  @Column('enum', { enum: ReceiptType, default: ReceiptType.INCOME })
  type: ReceiptType;

  @Field()
  @CurrencyColumn()
  amount: number;

  // TODO: Bug -> Return NaN
  @Field(() => GraphQLAnyType, { nullable: true })
  @CurrencyColumn({ nullable: true })
  tipAmount?: number;

  // TODO: Bug -> Return NaN
  @Field(() => GraphQLAnyType, { nullable: true })
  @CurrencyColumn({ nullable: true })
  giveAmount?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  paidAt?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedCustomerId?: string;

  @Field(() => CustomerEntity, { nullable: true })
  relatedCustomer?: CustomerEntity;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedTicketId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedOrderId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedLoanId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedLoanCode?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedPartnerId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  cashierUserId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  disbursementUserId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  note?: string;

  @Field(() => GraphQLAnyType, { nullable: true })
  @Column({ type: 'simple-json', nullable: true })
  data?: T;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'simple-array', nullable: true })
  assigneeUserIds: string[];

  @Field(() => ReceiptPaymentMethod, { nullable: true })
  @Column('enum', { enum: ReceiptPaymentMethod, nullable: true })
  paymentMethod?: ReceiptPaymentMethod;

  @Field(() => Number, { nullable: true })
  @Column({ nullable: true })
  expireAt?: number;

  @Field(() => ReceiptStatus)
  @Column('enum', { enum: ReceiptStatus, default: ReceiptStatus.PENDING })
  status: ReceiptStatus;

  @Column({ type: 'simple-json', nullable: true })
  @Field(() => GraphQLJSONObject, { nullable: true })
  dataChanged?: ReceiptDataChanged;

  @Field({ nullable: true })
  @Column({ nullable: true })
  isFixedAmount?: boolean;
}
