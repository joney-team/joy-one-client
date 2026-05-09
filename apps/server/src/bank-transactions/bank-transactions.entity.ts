import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import {
  BankTransactionPaymentGateway,
  BankTransactionStatus,
  BankTransactionType,
} from './bank-transactions.types';

@Entity('bank-transactions')
@Unique('bank-transactions-unqiue', ['code'])
export class BankTransactionEntity extends BaseMongoEntity {
  @Column()
  code: string;

  @Column()
  orderCode: number;

  @Column()
  workspaceId: string;

  @Column()
  amount: number;

  @Column()
  expiredAt: number;

  @Column()
  bankTransactionId?: string;

  @Column()
  relatedReceiptId?: string;

  @Column()
  paymentData?: any;

  @Column()
  paymentLinkId?: any;

  @Column()
  type: BankTransactionType;

  @Column()
  paymentGateway: BankTransactionPaymentGateway;

  @Column()
  status: BankTransactionStatus;

  @Column()
  isFulfilled?: boolean;

  @Column()
  failedReason?: string;
}
