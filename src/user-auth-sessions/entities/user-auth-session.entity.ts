import { BaseMongoEntity } from 'src/database/database.entities';
import { Column, Entity, Unique } from 'typeorm';
import { UserAuthSessionType } from '../user-auth-sessions.types';

@Entity('user-auth-sessions')
@Unique('user-auth-sessions-unique', ['code'])
export class UserAuthSessionEntity extends BaseMongoEntity {
  @Column()
  userId: string;

  @Column()
  code: string;

  @Column()
  type: UserAuthSessionType;

  @Column()
  expireAt: number;
}
