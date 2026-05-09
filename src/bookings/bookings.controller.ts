import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth, Customer, Member } from '../app.decorators';
import { CustomerEntity } from '../customers/customers.entity';
import { listBindData } from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { BookingsService } from './bookings.service';
import { CreateBookingArgs, RescheduleBookingArgs } from './bookings.types';

@Controller('bookings')
@ApiTags('Bookings')
export class BookingsController {
  constructor(private service: BookingsService) {}

  @Get('/customers')
  @Auth({ customer: true })
  async getCustomers(
    @Query() query: any,
    @Customer() customer: CustomerEntity,
  ) {
    return listBindData({
      list: async () => {
        const result = await this.service.list({
          query: { ...query, customerId: customer._id.toString() },
          workspaceId: customer.workspaceId,
        });
        return {
          count: result.total,
          data: result.results,
        };
      },
      bindData: (data) => this.service.bindData(data),
    });
  }

  @Get()
  @Auth({ permission: WorkspacePermission.BOOKING_VIEW })
  @ApiBearerAuth()
  async list(@Query() query: any, @Member() member: WorkspaceMember) {
    return listBindData({
      list: async () => {
        const result = await this.service.list({ query, member });
        return {
          count: result.total,
          data: result.results,
        };
      },
      bindData: (data) => this.service.bindData(data),
    });
  }

  @Post()
  @Auth({ permission: WorkspacePermission.BOOKING_MANAGER })
  @ApiBearerAuth()
  async create(
    @Member() member: WorkspaceMember,
    @Body() dto: CreateBookingArgs,
  ) {
    return this.service
      .create({ member, ...dto })
      .then((res) => this.service.bindData(res));
  }

  @Post('/reschedule')
  @Auth({ permission: WorkspacePermission.BOOKING_MANAGER })
  @ApiBearerAuth()
  async reschedule(
    @Body() dto: RescheduleBookingArgs,
    @Member() member: WorkspaceMember,
  ) {
    return this.service
      .reschedule({ member, ...dto })
      .then((res) => this.service.bindData(res));
  }

  // @Post('/:id/in-progress')
  // @Auth({ permission: WorkspacePermission.BOOKING_MANAGER })
  // @ApiBearerAuth()
  // async inProgress(
  //   @Param('id') id: any,
  //   @Workspace() ws: WorkspaceEntity,
  //   @User() user: UserEntity,
  // ) {
  //   return this.service
  //     .inProgress(user, ws, id)
  //     .then((res) => this.service.bindData(res));
  // }

  // @Post('/:id/check-in')
  // @Auth({ permission: WorkspacePermission.BOOKING_MANAGER })
  // @ApiBearerAuth()
  // async checkin(@Param('id') id: any, @Member() member: WorkspaceMember) {
  //   return this.service
  //     .checkin(member, id)
  //     .then((res) => this.service.bindData(res));
  // }

  // @Post('/:id/complete')
  // @Auth({ permission: WorkspacePermission.BOOKING_MANAGER })
  // @ApiBearerAuth()
  // async complete(
  //   @Param('id') id: any,
  //   @Workspace() ws: WorkspaceEntity,
  //   @User() user: UserEntity,
  // ) {
  //   return this.service
  //     .complete(user, ws, id)
  //     .then((res) => this.service.bindData(res));
  // }

  // @Post('/:id/cancel')
  // @Auth({ permission: WorkspacePermission.BOOKING_MANAGER })
  // async cancel(
  //   @Param('id') id: any,
  //   @Body() dto: CancelBookingArgs,
  //   @Workspace() ws: WorkspaceEntity,
  //   @User() user: UserEntity,
  // ) {
  //   return this.service
  //     .cancel(user, ws, id, dto)
  //     .then((res) => this.service.bindData(res));
  // }
}
