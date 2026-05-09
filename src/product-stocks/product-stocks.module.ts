import { forwardRef, Module } from '@nestjs/common';
import { PostgresEntities } from '../database/database.utils';
import { ProductsModule } from '../products/products.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { ProductStockRecordEntity } from './entities/product-stock-record.entity';
import { ProductStockEntity } from './entities/product-stock.entity';
import { ProductStockRecordsResolver } from './product-stock-records.resolver';
import { ProductStocksResolver } from './product-stocks.resolver';
import { ProductStocksService } from './product-stocks.service';

@Module({
  providers: [
    ProductStocksService,
    ProductStocksResolver,
    ProductStockRecordsResolver,
  ],
  exports: [ProductStocksService],
  imports: [
    PostgresEntities(ProductStockEntity, ProductStockRecordEntity),
    forwardRef(() => ProductsModule),
    WorkspaceMembersModule,
  ],
})
export class ProductStocksModule {}
