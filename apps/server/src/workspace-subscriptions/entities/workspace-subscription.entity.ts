import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import { WorkspaceSubscriptionStat } from '../workspace-subscriptions.types';

@Entity('workspace-subscriptions')
@Unique('workspace-subscriptions-unique', ['workspaceId'])
export class WorkspaceSubscriptionEntity extends BaseMongoEntity {
  @Column()
  workspaceId: string;

  @Column()
  subscriptionId: string;

  @Column()
  selectedSubscriptionId: string;

  @Column()
  fixedSubscriptionId?: string;

  @Column()
  stat: WorkspaceSubscriptionStat;

  @Column()
  billedStat?: WorkspaceSubscriptionStat;

  @Column()
  billedAt?: number;
}
