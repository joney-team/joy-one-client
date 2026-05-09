import { forwardRef, Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { CursorEntity } from '../database/database.cursor';
import { PostgresEntities } from '../database/database.utils';
import { ProductCombosModule } from '../product-combos/product-combos.module';
import { ProductStocksModule } from '../product-stocks/product-stocks.module';
import { ProductsModule } from '../products/products.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { UsersModule } from '../users/users.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { OrdersController } from './orders.controller';
import { OrderEntity } from './orders.entity';
import { OrdersResolver } from './orders.resolver';
import { OrdersService } from './orders.service';

@Module({
  providers: [OrdersService, OrdersResolver],
  controllers: [OrdersController],
  imports: [
    PostgresEntities(OrderEntity, CursorEntity),
    ProductsModule,
    forwardRef(() => ProductCombosModule),
    forwardRef(() => PromotionsModule),
    forwardRef(() => ReceiptsModule),
    CustomersModule,
    UsersModule,
    ProductStocksModule,
    WorkspaceMembersModule,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
