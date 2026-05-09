import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { configs } from '../config/config';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId, RawObjectId } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { PluginBanksService } from '../plugin-banks/plugin-banks.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { cryptoEncrypt } from '../utils/crypto.util';
import {
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { WorkspaceSettingEntity } from './entities/workspace-setting.entity';
import { UpdateWorkspaceSettingInput } from './workspace-settings.types';
import { normalizeWorkspaceSchedule } from './workspace-settings.utils';

@Injectable()
export class WorkspaceSettingsService {
  constructor(
    @InjectRepository(WorkspaceSettingEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<WorkspaceSettingEntity>,
    private readonly banks: PluginBanksService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async get(workspaceId: RawObjectId) {
    const settings =
      (await this.repository.findOne({
        where: { workspaceId: mustBeObjectId(workspaceId).toString() },
      })) || new WorkspaceSettingEntity();

    if (!settings._id) {
      settings.workspaceId = mustBeObjectId(workspaceId).toString();
    }

    if (!settings.bookingsAutoRemindCustomerBookingTime) {
      settings.bookingsAutoRemindCustomerBookingTime = '10:00';
    }

    settings.searchSettings = settings.searchSettings || {};
    settings.currencyCode = settings.currencyCode || 'USD';
    settings.memberPermissions = settings.memberPermissions || [];
    settings.zaloOaGmfGroupSettings = settings.zaloOaGmfGroupSettings || {};
    settings.view = settings.view
      ? {
          ...settings.view,
          dashboardWidgets: settings.view.dashboardWidgets?.filter(
            (widget) => Boolean(widget.id) && Boolean(widget.type),
          ),
          reportWidgets: settings.view.reportWidgets?.filter(
            (widget) => Boolean(widget.id) && Boolean(widget.type),
          ),
          menu: settings.view.menu?.filter(
            (menu) => Boolean(menu.id) && Boolean(menu.type),
          ),
        }
      : null;

    if (!settings._id) {
      await this.repository.save(settings);
    }

    return settings;
  }

  async patchUpdate(
    args: WithWorkspaceArgs<{ input: UpdateWorkspaceSettingInput }>,
  ) {
    const { input } = args;
    const { workspaceId, member } = withWorkspaceArgs(args);

    const settings = await this.get(workspaceId);

    // Tip
    settings.allowTip = input.allowTip;

    // Default Permissions
    settings.memberPermissions = input.memberPermissions || [];

    // Bookings
    settings.bookingsAutoRemindCustomerBookingBeforeDays =
      input.bookingsAutoRemindCustomerBookingBeforeDays;
    settings.bookingsAutoRemindCustomerBookingTime =
      input.bookingsAutoRemindCustomerBookingTime;
    settings.allowDuplicateBookings = input.allowDuplicateBookings;

    // Tickets
    settings.allowPayTicketMultipleTimes = !!input.allowPayTicketMultipleTimes;

    // Receipts
    settings.receiptImagesRequired = !!input.receiptImagesRequired;
    settings.receiptPaymentMethodDefault =
      input.receiptPaymentMethodDefault || null;

    // Workspace Work Slots
    settings.schedule = input.schedule
      ? normalizeWorkspaceSchedule(input.schedule)
      : null;

    // Auth Session Restricted
    settings.isAuthSessionRestricted = !!input.isAuthSessionRestricted;

    // Bank Account Information
    if (input.bankAccount) {
      if (
        !settings.bankAccount ||
        settings.bankAccount.bankId !== input.bankAccount.bankId ||
        settings.bankAccount.accountNumber !==
          input.bankAccount.accountNumber ||
        !settings.bankAccount.accountName
      ) {
        const bankInformation = await this.banks.getBankInformation(
          input.bankAccount.bankId,
        );
        if (bankInformation) {
          const bankAccount = await this.banks
            .getBankAccountInformation({
              bin: bankInformation.bin,
              accountNumber: input.bankAccount.accountNumber,
            })
            .catch(() => undefined);

          settings.bankAccount = {
            bankId: input.bankAccount.bankId,
            accountNumber: input.bankAccount.accountNumber,
            accountName: bankAccount?.accountName,
          };
        }
      }
    } else {
      settings.bankAccount = null;
    }

    // Currency
    settings.currencyCode = input.currencyCode;

    // Mailer Information
    if (input.mailer) {
      settings.mailer = {
        user: input.mailer.user.trim(),
        pass: cryptoEncrypt(
          {
            user: input.mailer.user.trim(),
            pass: input.mailer.pass,
          },
          configs.ENCRYPT_PASSWORD,
        ),
      };
    } else {
      settings.mailer = null;
    }

    // Credit
    settings.loanSettings = input.loanSettings;

    // Terms of Service & Privacy Policy
    settings.termsOfService = input.termsOfService;
    settings.privacyPolicy = input.privacyPolicy;

    // View
    settings.view = input.view || null;

    // Search Settings
    settings.searchSettings = input.searchSettings || null;

    // Zalo Oa GMF Group Settings
    settings.zaloOaGmfGroupSettings = input.zaloOaGmfGroupSettings || {};

    await this.repository.save(settings);

    this.queueProducers.registerWorkspaceSchedule(workspaceId);

    this.queueProducers.captureEvent({
      ref: settings._id.toString(),
      workspaceId: settings.workspaceId,
      type: EventType.WORKSPACE_SETTING_UPDATED,
      actionType: EventDataActionType.UPDATE,
      userId: member?.userId,
      persist: !!member,
    });

    return settings;
  }

  async getByAppDomain(domain: string) {
    return this.repository.findOne({ where: { appDomain: domain } });
  }
}
