import { Field, ObjectType } from '@nestjs/graphql';
import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { AttendanceSettingLocation } from '../attendance.types';

@ObjectType('AttendanceSetting')
@Entity('attendance-settings')
export class AttendanceSettingEntity extends BaseMongoEntity {
  @Field(() => [AttendanceSettingLocation], { nullable: true })
  @Column({ nullable: true })
  locations?: AttendanceSettingLocation[];
}
