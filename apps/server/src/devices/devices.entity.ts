import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity } from 'typeorm';
import { AppLocale } from '../lang/lang.types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Device')
@Entity('devices')
export class DeviceEntity extends BaseMongoEntity {
  @Field(() => String, { nullable: true })
  @Column()
  identifyId?: string;

  @Column()
  notificationToken?: string;

  @Field(() => AppLocale, { nullable: true })
  @Column()
  locale?: AppLocale;

  @Field(() => String)
  @Column()
  userAgent: string;

  @Field(() => Number)
  @Column()
  lastActiveAt: number;

  @Field(() => String, { nullable: true })
  @Column()
  userId?: string;

  @Field(() => String, { nullable: true })
  @Column()
  deviceName?: string;
}
