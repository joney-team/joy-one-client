import { Column, Entity, Unique } from 'typeorm';
import { BasePostgresEntity } from '../../database/database.entities';

@Entity('promotion-history')
@Unique('promotion-history-unique', ['ref'])
export class PromotionHistoryEntity extends BasePostgresEntity {
  @Column()
  promotionId: string;

  @Column()
  customerId: string;

  @Column()
  ref: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  note?: string;
}
