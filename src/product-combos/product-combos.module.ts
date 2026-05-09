import { forwardRef, Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { PostgresEntities } from '../database/database.utils';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { ProductComboHistoryEntity } from './entities/product-combo-history.entity';
import { ProductComboEntity } from './entities/product-combo.entity';
import { ProductCombosResolver } from './product-combos.resolver';
import { ProductCombosService } from './product-combos.service';

@Module({
  providers: [ProductCombosService, ProductCombosResolver],
  imports: [
    PostgresEntities(ProductComboEntity, ProductComboHistoryEntity),
    ProductsModule,
    forwardRef(() => CustomersModule),
    forwardRef(() => OrdersModule),
  ],
  exports: [ProductCombosService],
})
export class ProductCombosModule {}
