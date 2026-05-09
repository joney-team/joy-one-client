import { forwardRef, Module } from '@nestjs/common';
import { BookingsModule } from 'src/bookings/bookings.module';
import { CustomersModule } from 'src/customers/customers.module';
import { MongoEntities } from '../database/database.utils';
import { LoansModule } from '../loans/loans.module';
import { OrdersModule } from '../orders/orders.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { TasksModule } from '../tasks/tasks.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { ReportEntity } from './entities/report.entity';
import { ReportsResolver } from './reports.resolver';
import { ReportsService } from './reports.service';

@Module({
  providers: [ReportsService, ReportsResolver],
  imports: [
    MongoEntities(ReportEntity),
    CustomersModule,
    BookingsModule,
    ReceiptsModule,
    TasksModule,
    LoansModule,
    OrdersModule,
    forwardRef(() => WorkspaceMembersModule),
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
