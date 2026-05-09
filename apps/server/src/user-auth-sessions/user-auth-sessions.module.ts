import { Module, forwardRef } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { UsersModule } from '../users/users.module';
import { UserAuthSessionEntity } from './entities/user-auth-session.entity';
import { UserAuthSessionsService } from './user-auth-sessions.service';

@Module({
  providers: [UserAuthSessionsService],
  imports: [
    MongoEntities(UserAuthSessionEntity),
    forwardRef(() => UsersModule),
  ],
  exports: [UserAuthSessionsService],
})
export class UserAuthSessionsModule {}
