import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../app.decorators';
import { UserRole } from '../users/users.types';
import { SchedulingService } from './scheduling.service';

@Controller('scheduling')
@ApiTags('Scheduling')
export class SchedulingController {
  constructor(private readonly service: SchedulingService) {}

  @Post('/execSendWishBirthdayEmailToCustomers')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async execSendWishBirthdayEmailToCustomers(@Body() body: any) {
    return this.service.execSendWishBirthdayEmailToCustomers(body.workspaceId);
  }

  @Post('/execCheckBookingsToday')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async execCheckBookingsToday(@Body() body: any) {
    return this.service.execCheckBookingsToday(body.workspaceId);
  }

  @Post('/execSendReminderToCustomerBookingBeforeDay')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async execSendReminderToCustomerBookingBeforeDay(@Body() body: any) {
    return this.service.execSendReminderToCustomerBookingBeforeDay(
      body.workspaceId,
    );
  }

  @Post('/execWorkspaceSubscriptionBillings')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async execWorkspaceSubscriptionBillings(@Body() body: any) {
    return this.service.execWorkspaceSubscriptionBillings(body.workspaceId);
  }

  @Post('/execTriggerCreateEInvoices')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async execTriggerCreateEInvoices(@Body() body: any) {
    return this.service.execTriggerCreateEInvoices(body.workspaceId);
  }

  @Post('/heathcheckSocialConnections')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async heathcheckSocialConnections(@Body() body: any) {
    return this.service.heathcheckSocialConnections(body.workspaceId);
  }

  @Post('/execFetchExternalStorageSize')
  @Auth({ userRoles: [UserRole.ADMIN] })
  async execFetchExternalStorageSize(@Body() body: any) {
    return this.service.execFetchExternalStorageSize(body.workspaceId);
  }
}
