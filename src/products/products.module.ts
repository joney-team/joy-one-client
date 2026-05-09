import { Module } from '@nestjs/common';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';
import { CategoriesModule } from '../categories/categories.module';
import { MongoEntities } from '../database/database.utils';
import { ProductStocksModule } from '../product-stocks/product-stocks.module';
import { ProductEntity } from './entities/product.entity';
import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  providers: [ProductsService, ProductsResolver],
  imports: [
    MongoEntities(ProductEntity),
    WorkspacesModule,
    CategoriesModule,
    ProductStocksModule,
  ],
  exports: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
