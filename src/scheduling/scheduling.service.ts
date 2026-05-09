import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { logger } from '../app.logger';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../bookings/bookings.types';
import { IS_MAIN_MODE } from '../config/config';
import { CustomersService } from '../customers/customers.service';
import { mustBeObjectId, RawObjectId } from '../database/database.utils';
import { NotificationsService } from '../notifications/notifications.service';
import { PluginEInvoicesService } from '../plugin-e-invoices/plugin-e-invoices.service';
import {
  PluginEInvoiceTemplateAutoCreateMode,
  PluginEInvoiceTemplateType,
} from '../plugin-e-invoices/plugin-e-invoices.types';
import { PluginZaloOasService } from '../plugin-zalo-oas/plugin-zalo-oas.service';
import { PluginZaloOaZNSTemplateId } from '../plugin-zalo-oas/plugin-zalo-oas.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { ReceiptType } from '../receipts/receipts.types';
import { DateTime } from '../utils/date-time';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspaceSettingsService } from '../workspace-settings/workspace-settings.service';
import { WorkspaceSubscriptionsService } from '../workspace-subscriptions/workspace-subscriptions.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WithWorkspaceArgs } from '../workspaces/workspaces.utils';
import { getScheduleWorkingDay } from './scheduling.utils';

@Injectable()
export class SchedulingService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly workspaces: WorkspacesService,
    private readonly workspaceSettings: WorkspaceSettingsService,
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly workspaceSubscriptions: WorkspaceSubscriptionsService,
    private readonly customers: CustomersService,
    private readonly bookings: BookingsService,
    private readonly notifications: NotificationsService,
    private readonly pluginZaloOas: PluginZaloOasService,
    private readonly pluginEInvoices: PluginEInvoicesService,
    private readonly receipts: ReceiptsService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async onApplicationBootstrap() {
    if (!IS_MAIN_MODE) return;

    this.workspaces.repository
      .find({
        where: { isArchived: { $ne: true } },
      })
      .then((workspaces) => {
        workspaces.forEach((ws) => {
          this.registerWorkspaceSchedule(ws._id.toString());
        });
      });
  }

  getJob(name: string): CronJob | undefined {
    try {
      return this.schedulerRegistry.getCronJob(name);
    } catch (error) {
      return undefined;
    }
  }

  registerJob(workspaceId: RawObjectId, name: string, cronJob: CronJob) {
    const jobName = `WS-${workspaceId}-${name}`;
    const currentJob = this.getJob(jobName);
    if (currentJob) this.schedulerRegistry.deleteCronJob(jobName);

    this.schedulerRegistry.addCronJob(jobName, cronJob);
    cronJob.start();
    return cronJob;
  }

  async beforeProcessing(workspaceId: any) {
    const workspace = await this.workspaces.get(workspaceId);
    return workspace.isArchived !== true;
  }

  async registerWorkspaceSchedule(workspaceId: string) {
    const settings = await this.workspaceSettings.get(workspaceId);

    // Each day of week
    for (let dayWeek = 1; dayWeek <= 7; dayWeek++) {
      const { startTime, endTime } = getScheduleWorkingDay({
        dayWeek,
        setting: settings.schedule,
      });

      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      // Start day
      this.registerJob(
        workspaceId,
        `START_DAY-${dayWeek}`,
        new CronJob(`0 ${startMin} ${startHour} * * ${dayWeek}`, async () => {
          const isAvailable = await this.beforeProcessing(workspaceId);
          if (!isAvailable) return;

          await this.queueProducers.purgeWorkspaceReports({ workspaceId });
          await this.queueProducers.healthCheckLoans({ workspaceId });
          await this.queueProducers.rejectPendingLoans({ workspaceId });

          await this.execCheckBookingsToday(workspaceId);
        }),
      );

      // End day
      this.registerJob(
        workspaceId,
        `END_DAY-${dayWeek}`,
        new CronJob(`0 ${endMin} ${endHour} * * ${dayWeek}`, async () => {
          const isAvailable = await this.beforeProcessing(workspaceId);
          if (!isAvailable) return;

          await this.queueProducers.purgeWorkspaceReports({ workspaceId });
        }),
      );

      // At 8 AM every day
      this.registerJob(
        workspaceId,
        `EVERYDAY`,
        new CronJob(`0 0 8 * * *`, async () => {
          const isAvailable = await this.beforeProcessing(workspaceId);
          if (!isAvailable) return;
          await this.queueProducers.aggregateWorkspaceStats({ workspaceId });
          await this.execSendWishBirthdayEmailToCustomers(workspaceId);
          await this.execTriggerCreateEInvoices(workspaceId);
          await this.heathcheckSocialConnections(workspaceId);
          await this.execFetchExternalStorageSize({ workspaceId });
        }),
      );

      // Remind customer bookings
      const [hour, minute] = (
        settings.bookingsAutoRemindCustomerBookingTime || '10:00'
      )
        .split(':')
        .map((v) => parseInt(v));

      if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
        this.registerJob(
          workspaceId,
          `EVERYDAY-REMIND-BOOKINGS`,
          new CronJob(`0 ${minute} ${hour} * * *`, async () => {
            const isNext = await this.beforeProcessing(workspaceId);
            if (!isNext) return;
            await this.execSendReminderToCustomerBookingBeforeDay(workspaceId);
          }),
        );
      }
    }
  }

  // Check bookings today
  async execCheckBookingsToday(workspaceId: any) {
    try {
      const ws = await this.workspaces.get(workspaceId);
      if (ws.isArchived) return;

      const members = await this.workspaceMembers.getAll(workspaceId);

      const dayRange = DateTime.getRange(new Date(), 'day');

      // Bookings
      await this.bookings
        .list({
          query: {
            rangeStartTime: `${DateTime.toSeconds(dayRange.start)}-${DateTime.toSeconds(dayRange.end)}`,
            status: [
              BookingStatus.JUST_CREATED,
              BookingStatus.CHECK_IN,
              BookingStatus.IN_PROGRESS,
            ],
            getAll: true,
          },
          workspaceId: ws._id.toString(),
        })
        .then(async ({ results: bookings }) => {
          await Promise.all(
            members.map(async (member) => {
              const relatedBookings = bookings.filter((v) =>
                v.assigneeUserIds.includes(member.userId),
              );

              if (relatedBookings.length > 0) {
                this.notifications.create({
                  workspaceId: ws._id.toString(),
                  title: 'bookings_today',
                  body: 'bookings_today_body',
                  bodyParams: { amount: relatedBookings.length },
                  userId: member.userId,
                  route: `/bookings?bk-view=day`,
                });
              }
            }),
          );
        });
    } catch (error) {
      logger.error(error, {
        case: 'execCheckBookingsToday: failed',
        fields: {
          workspaceId,
        },
      });
    }
  }

  // Send email to customers who have birthday today
  async execSendWishBirthdayEmailToCustomers(workspaceId: any) {
    try {
      const workspace = await this.workspaces.get(workspaceId);
      const now = new Date();
      const date = now.getDate();
      const month = now.getMonth();

      const customers = await this.customers.list({
        workspaceId,
        query: {
          birthdayDate: date,
          birthdayMonth: month,
          getAll: true,
        },
      });

      customers.results.map((customer) => {
        const birthday = DateTime.normalizeDate(customer.birthday);
        if (!birthday) return;

        if (customer.email)
          if (customer.phone)
            this.pluginZaloOas
              .sendZNS({
                workspaceId: customer.workspaceId,
                input: {
                  phoneNumber: customer.phone,
                  templateId: PluginZaloOaZNSTemplateId.CUSTOMER_BIRTHDAY,
                  data: {
                    customer_name: customer.name,
                    company_name: workspace.name,
                  },
                },
              })
              .then((isSent) => {
                if (!isSent) throw Error('Plugin Zalo unavailable');
              })
              .catch((error) => {
                // TODO: Send SMS
              });
      });
    } catch (error) {
      logger.error(error, {
        case: 'execSendWishBirthdayEmailToCustomers: failed',
        fields: {
          workspaceId,
        },
      });
    }
  }

  // Send reminder to customer booking before day
  async execSendReminderToCustomerBookingBeforeDay(workspaceId: any) {
    try {
      const settings = await this.workspaceSettings.get(workspaceId);

      if (
        settings.bookingsAutoRemindCustomerBookingBeforeDays &&
        settings.bookingsAutoRemindCustomerBookingBeforeDays > 0
      ) {
        const oneDay = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const range = DateTime.getRange(
          now + oneDay * settings.bookingsAutoRemindCustomerBookingBeforeDays,
          'day',
        );

        const bookings = await this.bookings.list({
          query: {
            getAll: true,
            fromTime: DateTime.toSeconds(range.start),
            toTime: DateTime.toSeconds(range.end),
            status: [BookingStatus.JUST_CREATED],
          },
          workspaceId,
        });

        for (let i = 0; i < bookings.results.length; i++) {
          // TODO: Send reminder to customer booking before day (ZNS)
        }
      }
    } catch (error) {
      logger.error(error, {
        case: 'execSendReminderToCustomerBookingBeforeDay: failed',
        fields: {
          data: { workspaceId },
        },
      });
    }
  }

  // Heathcheck social connections
  async heathcheckSocialConnections(workspaceId: RawObjectId) {
    try {
      const oas = await this.pluginZaloOas.getOas(workspaceId);
      await Promise.all(oas.map((oa) => this.pluginZaloOas.healthCheck(oa)));
    } catch {}
  }

  // Workspace subscription -> Handle billings
  async execWorkspaceSubscriptionBillings(workspaceId: RawObjectId) {
    await this.workspaceSubscriptions
      .handleBillings(mustBeObjectId(workspaceId).toString())
      .catch((error) => {
        logger.error(error, {
          case: `execWorkspaceSubscriptionBillings: failed`,
          fields: { workspaceId },
        });
      });
  }

  async execTriggerCreateEInvoices(workspaceId: RawObjectId) {
    try {
      const [provider] = await this.pluginEInvoices.getProviders({
        workspaceId,
      });

      if (!provider) return;

      if (provider.templates[PluginEInvoiceTemplateType.LOAN_INCOME_RECEIPT]) {
        const { autoCreateMode } =
          provider.templates[PluginEInvoiceTemplateType.LOAN_INCOME_RECEIPT];

        if (
          autoCreateMode === PluginEInvoiceTemplateAutoCreateMode.EXPIRE_TIME
        ) {
          const receipts = await this.receipts.list({
            workspaceId,
            query: {
              timeRangeExpireAt: `date-${DateTime.getNowInSeconds()}`,
              type: ReceiptType.INCOME,
              getAll: true,
            },
          });

          for (const receipt of receipts.results) {
            await this.queueProducers.pluginEInvoicesCreateInvoice({
              workspaceId,
              input: {
                receiptId: receipt.id,
              },
            });
          }
        }
      }
    } catch (error) {
      logger.error(error, {
        case: 'execTriggerCreateEInvoices: failed',
        fields: {
          workspaceId,
        },
      });
    }
  }

  async execFetchExternalStorageSize(args: WithWorkspaceArgs) {
    try {
      await this.queueProducers.externalStorageFetchSize(args);
    } catch (error) {
      logger.error(error, {
        case: 'execFetchExternalStorageSize: failed',
        fields: args,
      });
    }
  }
}
