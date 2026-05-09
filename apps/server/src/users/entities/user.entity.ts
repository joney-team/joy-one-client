import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import {
  UserAuthProvider,
  UserRole,
  UserSettings,
  UserConnectionStatus,
  UserType,
} from '../users.types';
import { AppLocale } from '../../lang/lang.types';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('User')
@Entity('users')
@Unique('users-unique', ['email'])
export class UserEntity extends BaseMongoEntity {
  @Field(() => UserType)
  @Column()
  type: UserType;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  email: string;

  @Field(() => String)
  @Column()
  avatar?: string;

  @Field(() => Number)
  @Column()
  birthday?: number;

  @Field(() => String)
  @Column()
  phone?: string;

  @Field(() => String)
  @Column()
  color?: string;

  @Field(() => Boolean)
  @Column()
  isEmailVerified?: boolean;

  @Field(() => String)
  @Column()
  password?: string;

  @Field(() => Number)
  @Column({ nullable: false, default: 0 })
  authVersion: number;

  @Field(() => UserRole)
  @Column()
  role: UserRole;

  @Field(() => Number)
  @Column()
  lastSignInAt?: number;

  @Field(() => String)
  @Column()
  provider?: string;

  @Field(() => [UserAuthProvider])
  @Column()
  providers: UserAuthProvider[];

  @Field(() => String)
  @Column()
  activatedWorkspaceId?: string;

  @Field(() => String)
  @Column()
  refCode?: string;

  @Field(() => AppLocale)
  @Column()
  locale?: AppLocale;

  @Column()
  settings?: UserSettings;

  @Field(() => UserConnectionStatus)
  @Column()
  connectionStatus?: UserConnectionStatus;
}
