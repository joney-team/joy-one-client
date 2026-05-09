import { Module } from '@nestjs/common';
import { OrderEntity } from 'src/orders/orders.entity';
import { CustomerEntity } from '../customers/customers.entity';
import { MongoEntities, PostgresEntities } from '../database/database.utils';
import { LoanEntity } from '../loans/entities/loan.entity';
import { MessageBoxEntity } from '../message-boxes/entities/message-box.entity';
import { MessageEntity } from '../message-boxes/entities/message.entity';
import { PartnerEntity } from '../partners/partners.entity';
import { PrescriptionEntity } from '../prescriptions/entities/prescription.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { ReceiptEntity } from '../receipts/entities/receipt.entity';
import { TagEntity } from '../tags/entities/tag.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { UserEntity } from '../users/entities/user.entity';
import { WorkspaceBranchEntity } from '../workspace-branches/entities/workspace-branch.entity';
import { WorkspaceMemberEntity } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspaceSettingsModule } from '../workspace-settings/workspace-settings.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PostEntity } from '../posts/entities/post.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { SearchResolver } from './search.resolver';

@Module({
  providers: [SearchService, SearchResolver],
  imports: [
    PostgresEntities(ReceiptEntity, OrderEntity, LoanEntity),
    MongoEntities(
      CustomerEntity,
      TaskEntity,
      ProductEntity,
      TagEntity,
      PartnerEntity,
      PrescriptionEntity,
      WorkspaceMemberEntity,
      WorkspaceBranchEntity,
      UserEntity,
      MessageBoxEntity,
      MessageEntity,
      PostEntity,
      CategoryEntity,
    ),
    WorkspaceSettingsModule,
    WorkspaceMembersModule,
    ProductsModule,
  ],
  exports: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
