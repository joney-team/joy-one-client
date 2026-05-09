import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { CustomersModule } from '../customers/customers.module';
import { ProductsModule } from '../products/products.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { TagsModule } from '../tags/tags.module';
import { UsersModule } from '../users/users.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspaceRolesModule } from '../workspace-roles/workspace-roles.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { HelpersController } from './helpers.controller';

@Module({
  controllers: [HelpersController],
  imports: [
    UsersModule,
    WorkspacesModule,
    WorkspaceMembersModule,
    CustomersModule,
    TagsModule,
    BookingsModule,
    ProductsModule,
    ReceiptsModule,
    WorkspaceRolesModule,
  ],
})
export class HelpersModule {}
