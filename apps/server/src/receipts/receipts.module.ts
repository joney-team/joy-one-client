import { Module, forwardRef } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { PostgresEntities } from '../database/database.utils';
import { LoansModule } from '../loans/loans.module';
import { OrdersModule } from '../orders/orders.module';
import { WorkspacePartnersModule } from '../partners/partners.module';
import { ProductCombosModule } from '../product-combos/product-combos.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { ReceiptsController } from './receipts.controller';
import { ReceiptEntity } from './entities/receipt.entity';
import { ReceiptsService } from './receipts.service';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspaceBranchesModule } from '../workspace-branches/workspace-branches.module';
import { CursorEntity } from '../database/database.cursor';
import { ReceiptsResolver } from './receipts.resolver';

@Module({
  imports: [
    PostgresEntities(ReceiptEntity, CursorEntity),
    forwardRef(() => UsersModule),
    WorkspacePartnersModule,
    ProductsModule,
    forwardRef(() => ProductCombosModule),
    forwardRef(() => LoansModule),
    forwardRef(() => CustomersModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => WorkspaceMembersModule),
    WorkspaceBranchesModule,
  ],
  providers: [ReceiptsService, ReceiptsResolver],
  controllers: [ReceiptsController],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
