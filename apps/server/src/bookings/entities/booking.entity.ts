import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { BookingStatus } from '../bookings.types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Booking')
@Entity('bookings')
export class BookingEntity extends BaseMongoEntity {
  @Field({ nullable: true })
  @Column()
  title?: string;

  @Field({ nullable: true })
  @Column()
  note?: string;

  @Field({ nullable: true })
  @Column()
  customerId?: string;

  @Field(() => [String])
  @Column()
  assigneeUserIds: string[];

  @Field(() => String)
  @Column()
  workspaceId: string;

  @Field()
  @Column()
  startTime: number;

  @Field()
  @Column()
  endTime: number;

  @Field({ nullable: true })
  @Column()
  reasonForCancellation?: string;

  @Field({ nullable: true })
  @Column()
  transferToBookingId?: string;

  @Field(() => BookingStatus)
  @Column()
  status: BookingStatus;
}
