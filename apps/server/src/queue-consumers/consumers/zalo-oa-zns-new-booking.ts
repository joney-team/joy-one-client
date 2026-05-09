import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BookingsService } from '../../bookings/bookings.service';
import { defaultWorkerOptions } from '../../config/config.constants';
import { CustomersService } from '../../customers/customers.service';
import { PluginZaloOasService } from '../../plugin-zalo-oas/plugin-zalo-oas.service';
import { PluginZaloOaZNSTemplateId } from '../../plugin-zalo-oas/plugin-zalo-oas.types';
import { DateTime } from '../../utils/date-time';
import { WorkspaceBranchesService } from '../../workspace-branches/workspace-branches.service';
import { WorkspacesService } from '../../workspaces/workspaces.service';
import { QueueName } from '../queue-consumers.types';

export interface SendZaloOaZnsNewBookingArgs {
  bookingId: string;
  workspaceId: string;
}

@Processor(QueueName.ZALO_OA_ZNS_NEW_BOOKING, {
  ...defaultWorkerOptions,
  concurrency: 1,
})
export class ZaloOaZnsNewBookingConsumer extends WorkerHost {
  constructor(
    private readonly pluginZaloOas: PluginZaloOasService,
    private readonly bookings: BookingsService,
    private readonly customers: CustomersService,
    private readonly workspaces: WorkspacesService,
    private readonly workspaceBranches: WorkspaceBranchesService,
  ) {
    super();
  }

  async process(job: Job<SendZaloOaZnsNewBookingArgs>) {
    const booking = await this.bookings.get({
      id: job.data.bookingId,
      workspaceId: job.data.workspaceId,
    });
    if (!booking.customerId) return { message: 'Booking has no customer' };

    const customer = await this.customers.get({
      id: booking.customerId,
      workspaceId: booking.workspaceId,
    });
    if (!customer.phone) return { message: 'Customer has no phone' };

    const workspace = await this.workspaces.get(booking.workspaceId);
    const workspaceBranch = booking.workspaceBranchId
      ? await this.workspaceBranches.getById(booking.workspaceId)
      : null;

    const date = DateTime.normalizeDate(booking.startTime);
    const dateWithFormat = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '/')}/${(date.getMonth() + 1).toString().padStart(2, '/')}/${date.getFullYear()}`;

    const isSent = await this.pluginZaloOas.sendZNS({
      workspaceId: booking.workspaceId,
      input: {
        templateId: PluginZaloOaZNSTemplateId.BOOKING,
        phoneNumber: customer.phone,
        data: {
          schedule_time: dateWithFormat,
          customer_name: customer.name,
          booking_code: customer.code,
          address:
            workspaceBranch?.location?.address ?? workspace.location.address,
        },
      },
    });

    if (!isSent) return { message: 'Cannot send ZNS' };
    return { message: 'Send ZNS success' };
  }
}
