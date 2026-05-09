import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';

@Entity('subscriptions')
export class SubscriptionEntity extends BaseMongoEntity {
  @Column()
  name: string;

  @Column()
  color: string;

  @Column()
  pricePerMember: number;

  @Column()
  pricePerMemberNotSale?: number;

  @Column()
  limitMembers: number;

  @Column()
  limitStorage: number;

  @Column()
  limitSocialConnections: number;

  @Column()
  isPrivate?: boolean;

  @Column()
  isDefault: boolean;
}
