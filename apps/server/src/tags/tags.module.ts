import { Module } from '@nestjs/common';
import { MongoEntities } from '../database/database.utils';
import { TagEntity } from './entities/tag.entity';
import { TagsResolver } from './tags.resolver';
import { TagsService } from './tags.service';

@Module({
  providers: [TagsService, TagsResolver],
  imports: [MongoEntities(TagEntity)],
  exports: [TagsService],
})
export class TagsModule {}
