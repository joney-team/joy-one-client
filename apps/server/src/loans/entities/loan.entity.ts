import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectColumn } from 'src/database/database.utils';
import { Column, Entity, Unique } from 'typeorm';
import { BasePostgresEntity } from '../../database/database.entities';
import { GraphQLAnyType } from '../../graphql/graphql-type';
import { Coordinates } from '../../locations/locations.types';
import {
  LoanAssetType,
  LoanMetadata,
  LoanPackage,
  LoanPayment,
  LoanPaymentPeriod,
  LoanPaymentProgress,
  LoanStatus,
} from '../loans.types';

@ObjectType('Loan')
@Entity('loans')
@Unique('loans-unique', ['code'])
export class LoanEntity extends BasePostgresEntity {
  @Field()
  @Column()
  code: string;

  @Field()
  @Column()
  customerId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  customerCidNumber?: string;

  @Field({ nullable: true })
  @Column()
  workspaceBranchId?: string;

  @Field()
  @Column()
  amount: number;

  @Field()
  @Column()
  packageId: string;

  @Field(() => LoanPackage)
  @ObjectColumn()
  package: LoanPackage;

  @Field()
  @Column()
  packagePeriodDays: number;

  @Field(() => [LoanPaymentPeriod], { nullable: true })
  @ObjectColumn({ nullable: true })
  paymentPeriods?: LoanPaymentPeriod[];

  @Field(() => LoanAssetType)
  @Column('enum', { enum: LoanAssetType })
  assetType: LoanAssetType;

  @Field(() => GraphQLAnyType, { nullable: true })
  @ObjectColumn()
  assetData: any;

  @Field(() => LoanStatus)
  @Column('enum', { enum: LoanStatus })
  status: LoanStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  rejectReason?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  signature?: string;

  @Field(() => LoanPayment, { nullable: true })
  @Column('simple-json', { nullable: true })
  payment?: LoanPayment;

  @Field(() => Coordinates, { nullable: true })
  @Column('simple-json', { nullable: true })
  coord?: Coordinates;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fulfilledAt?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  isLiquidated?: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  nextReceiptAt?: number;

  @Field(() => [LoanPaymentProgress], { nullable: true })
  @Column('simple-json', { nullable: true })
  paymentProgress?: LoanPaymentProgress[];

  @Field(() => LoanMetadata, { nullable: true })
  @Column('simple-json', { nullable: true })
  metadata?: LoanMetadata;

  @Field({ nullable: true })
  @Column({ nullable: true })
  isHasLateInterestReceipt?: boolean;
}
