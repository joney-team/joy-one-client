import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { FilesModule } from '../files/files.module';
import { UsersController } from './users.controller';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [MongoEntities(UserEntity), FilesModule],
  controllers: [UsersController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
