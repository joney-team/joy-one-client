import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { MongoEntities } from '../database/database.utils';
import { PostsController } from './posts.controller';
import { PostEntity } from './entities/post.entity';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';

@Module({
  providers: [PostsService, PostsResolver],
  imports: [MongoEntities(PostEntity), CategoriesModule],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
