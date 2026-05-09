import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongoEntities } from '../database/database.utils';
import { CategoryEntity } from './entities/category.entity';
import { CategoriesResolver } from './categories.resolver';

@Module({
  providers: [CategoriesService, CategoriesResolver],
  imports: [MongoEntities(CategoryEntity)],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
