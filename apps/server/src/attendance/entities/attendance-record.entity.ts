import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { Coordinates } from '../../locations/locations.types';
import {
  AttendanceRecordMethod,
  AttendanceRecordStatus,
  AttendanceRecordType,
} from '../attendance.types';

@ObjectType('AttendanceRecord')
@Entity('attendance-records')
export class AttendanceRecordEntity extends BaseMongoEntity {
  @Field()
  @Column()
  deviceId: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  workspaceId: string;

  @Field()
  @Column()
  time: number;

  @Field(() => AttendanceRecordType)
  @Column()
  type: AttendanceRecordType;

  @Field(() => AttendanceRecordMethod)
  @Column()
  method: AttendanceRecordMethod;

  @Field(() => AttendanceRecordStatus)
  @Column()
  status: AttendanceRecordStatus;

  @Field(() => Coordinates, { nullable: true })
  @Column()
  locationCoordinates?: Coordinates;

  @Field({ nullable: true })
  @Column({ nullable: true })
  locationId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  photoUrl?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  note?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  rejectedAt?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  rejectedByUserId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  rejectedReason?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  approvedAt?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  approvedByUserId?: string;
}
