import { Module } from '@nestjs/common';
import { CustomersModule } from 'src/customers/customers.module';
import { UsersModule } from 'src/users/users.module';
import { MongoEntities } from '../database/database.utils';
import { PluginZaloOAsModule } from '../plugin-zalo-oas/plugin-zalo-oas.module';
import { WorkspaceMembersModule } from '../workspace-members/workspace-members.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { BookingsController } from './bookings.controller';
import { BookingEntity } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsResolver } from './bookings.resolver';

@Module({
  providers: [BookingsService, BookingsResolver],
  controllers: [BookingsController],
  imports: [
    MongoEntities(BookingEntity),
    UsersModule,
    CustomersModule,
    WorkspacesModule,
    WorkspaceMembersModule,
    PluginZaloOAsModule,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
