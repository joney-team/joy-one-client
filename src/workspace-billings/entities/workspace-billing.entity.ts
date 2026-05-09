import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import {
  WorkspaceBillingStatus,
  WorkspaceBillingType,
} from '../workspace-billings.types';

@Entity('workspace-billings')
@Unique('workspace-billings-unique', ['code'])
export class WorkspaceBillingEntity extends BaseMongoEntity {
  @Column()
  code: string;

  @Column()
  transactionId?: string;

  @Column()
  note?: string;

  @Column()
  amount: number;

  @Column()
  balance: number;

  @Column()
  workspaceId: string;

  @Column()
  data?: any;

  @Column()
  createdByUserId?: string;

  @Column()
  manualSettlementByUserId?: string;

  @Column()
  relatedWorkspaceSubscriptionId?: string;

  @Column()
  relatedBankTransactionId?: string;

  @Column()
  type: WorkspaceBillingType;

  @Column()
  status: WorkspaceBillingStatus;

  @Column()
  isOnNotification?: boolean;
}
