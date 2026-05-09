import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { DatabaseName } from '../database/database.types';
import { mustBeObjectId } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { FilesService } from '../files/files.service';
import { PluginMetaPagesService } from '../plugin-meta-pages/plugin-meta-pages.service';
import { PluginZaloOasService } from '../plugin-zalo-oas/plugin-zalo-oas.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { DateTime } from '../utils/date-time';
import { WorkspaceBillingsService } from '../workspace-billings/workspace-billings.service';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { WorkspaceSubscriptionEntity } from './entities/workspace-subscription.entity';
import {
  CalculateWorkspaceSubscriptionBillingResponse,
  CalculateWorkspaceSubscriptionBillingsDto,
  SelectWorkspaceSubscriptionDto,
  SetFixedWorkspaceSubscriptionDto,
  WorkspaceSubscriptionStat,
} from './workspace-subscriptions.types';

@Injectable()
export class WorkspaceSubscriptionsService {
  constructor(
    @InjectRepository(WorkspaceSubscriptionEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<WorkspaceSubscriptionEntity>,
    private readonly subscriptions: SubscriptionsService,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private readonly workspaceMembers: WorkspaceMembersService,
    @Inject(forwardRef(() => WorkspaceBillingsService))
    private readonly workspaceBillings: WorkspaceBillingsService,
    @Inject(forwardRef(() => FilesService))
    private readonly files: FilesService,
    private readonly pluginMetaPages: PluginMetaPagesService,
    private readonly pluginZaloOAs: PluginZaloOasService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async get(_workspaceId: string) {
    const workspaceId = mustBeObjectId(_workspaceId).toString();
    let workspaceSubscription =
      (await this.repository.findOne({ where: { workspaceId } })) ||
      new WorkspaceSubscriptionEntity();

    if (!workspaceSubscription._id) {
      workspaceSubscription.workspaceId = workspaceId;
      await this.repository.save(workspaceSubscription);
    }

    let subscription: SubscriptionEntity;
    let subscriptionId: string;

    const selectedSubscription: SubscriptionEntity | undefined =
      workspaceSubscription.selectedSubscriptionId
        ? await this.subscriptions
            .get(workspaceSubscription.selectedSubscriptionId)
            .catch(() => undefined)
        : undefined;

    if (workspaceSubscription.fixedSubscriptionId) {
      subscription = await this.subscriptions.get(
        workspaceSubscription.fixedSubscriptionId,
      );
      subscriptionId = workspaceSubscription.fixedSubscriptionId;
    } else if (selectedSubscription) {
      subscription = selectedSubscription;
      subscriptionId = selectedSubscription._id.toString();
    } else {
      subscription = await this.subscriptions.getDefault();
      subscriptionId = subscription._id.toString();
    }

    const [totalMembers, storage, totalMetaPages, totalZaloOAs] =
      await Promise.all([
        this.workspaceMembers.getTotalMembers(workspaceId),
        this.files
          .getWorkspaceCapacity(workspaceId)
          .then((res) => res.totalSizeInBytes),
        this.pluginMetaPages
          .getPages({ workspaceId })
          .then((res) => res.length),
        this.pluginZaloOAs.getOas(workspaceId).then((res) => res.length),
      ]);

    workspaceSubscription.stat = {
      totalMembers,
      storage,
      totalMetaPages,
      totalZaloOAs,
      subscriptionId,
    };

    return {
      ...workspaceSubscription,
      selectedSubscription,
      subscription,
      subscriptionId,
    };
  }

  async select(workspaceId: string, dto: SelectWorkspaceSubscriptionDto) {
    const subscription = await this.subscriptions.get(dto.subscriptionId);
    const workspaceSubscription = await this.get(workspaceId);

    if (dto.subscriptionId === workspaceSubscription.subscriptionId) {
      throw new ForbiddenException(AppMessage.WORKSPACE_SUBSCRIPTION_ACTIVATED);
    }

    if (!!workspaceSubscription.fixedSubscriptionId) {
      throw new ForbiddenException(
        AppMessage.WORKSPACE_SUBSCRIPTION_CANNOT_CHANGED,
      );
    }

    if (subscription.isPrivate) {
      throw new ForbiddenException(
        AppMessage.WORKSPACE_SUBSCRIPTION_CANNOT_SELECT,
      );
    }

    workspaceSubscription.selectedSubscriptionId = subscription._id.toString();
    await this.repository.update(workspaceSubscription._id, {
      selectedSubscriptionId: subscription._id.toString(),
    });
    await this.handleBillings(workspaceId);
    return this.get(workspaceId);
  }

  async setFixed(workspaceId: string, dto: SetFixedWorkspaceSubscriptionDto) {
    const workspaceSubscription = await this.get(workspaceId);

    if (dto.subscriptionId) {
      const subscription = await this.subscriptions.get(dto.subscriptionId);
      workspaceSubscription.fixedSubscriptionId = subscription._id.toString();
    } else {
      workspaceSubscription.fixedSubscriptionId = null;
    }

    await this.repository.update(workspaceSubscription._id, {
      fixedSubscriptionId: workspaceSubscription.fixedSubscriptionId || null,
    });

    this.queueProducers.captureEvent({
      type: EventType.WORKSPACE_SUBSCRIPTION_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: workspaceSubscription.workspaceId,
    });

    return this.get(workspaceSubscription.workspaceId);
  }

  async calculateBilling(dto: CalculateWorkspaceSubscriptionBillingsDto) {
    const now = DateTime.normalizeDate(dto.time ?? new Date());
    let totalPrice = 0;

    const totalMembers =
      dto.totalMembers ||
      (await this.workspaceMembers
        .getAll(dto.workspaceId)
        .then((res) => res.length));
    const workspaceSubscription = await this.get(dto.workspaceId);

    const selectedSubscription: SubscriptionEntity = dto?.selectedSubscriptionId
      ? await this.subscriptions.get(dto?.selectedSubscriptionId)
      : workspaceSubscription.selectedSubscription ||
        (await this.subscriptions.getDefault());

    const billedSubscription: SubscriptionEntity =
      (workspaceSubscription.billedStat
        ? await this.subscriptions
            .get(workspaceSubscription.billedStat?.subscriptionId)
            .catch(() => undefined)
        : undefined) || (await this.subscriptions.getDefault());

    const billedMembers = workspaceSubscription.billedStat?.totalMembers || 0;
    const diffTotalMembers = totalMembers - billedMembers;

    const billingFrom = workspaceSubscription.billedAt
      ? DateTime.normalizeDate(workspaceSubscription.billedAt)
      : DateTime.normalizeDate(workspaceSubscription.createdAt);

    const billingTo = new Date(
      billingFrom.getFullYear(),
      billingFrom.getMonth() + 1,
      billingFrom.getDate(),
    );

    const totalBillingDays =
      (billingTo.getTime() - billingFrom.getTime()) / (1000 * 60 * 60 * 24);
    const billingDays = Math.ceil(
      (billingTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Thu tiền số lượng users tăng thêm
    if (diffTotalMembers > 0) {
      const amountPercent = billingDays / totalBillingDays;
      totalPrice = Math.ceil(
        diffTotalMembers * selectedSubscription.pricePerMember * amountPercent,
      );
    }

    // Cashback số lượng users giảm đi
    if (diffTotalMembers < 0) {
      const amountPercent = billingDays / totalBillingDays;
      totalPrice = -Math.ceil(
        Math.abs(diffTotalMembers) *
          billedSubscription.pricePerMember *
          amountPercent,
      );
    }

    const isNewMonth = now.getTime() >= billingTo.getTime();
    const isChangePlan =
      billedSubscription._id.toString() !== selectedSubscription._id.toString();

    // New Month
    if (isNewMonth) {
      totalPrice = Math.ceil(
        totalMembers * selectedSubscription.pricePerMember,
      );
    } else if (isChangePlan) {
      // Change plan
      const currentTotalPrice =
        billedSubscription.pricePerMember * billedMembers;
      const newTotalPrice = selectedSubscription.pricePerMember * totalMembers;
      const amountPercent = billingDays / totalBillingDays;
      const diffPrice = newTotalPrice - currentTotalPrice;
      totalPrice = Math.ceil(diffPrice * amountPercent);

      // Over total members
      if (
        totalMembers > selectedSubscription.limitMembers &&
        selectedSubscription.limitMembers > 0
      ) {
        throw new BadRequestException(
          AppMessage.WORKSPACE_SUBSCRIPTION_OVER_LIMIT_MEMBERS,
        );
      }
    }

    const billedStat: WorkspaceSubscriptionStat = {
      ...workspaceSubscription.stat,
      subscriptionId: selectedSubscription._id.toString(),
    };

    if (
      !workspaceSubscription.billedAt ||
      workspaceSubscription.billedAt < DateTime.getNowInSeconds()
    ) {
      workspaceSubscription.billedAt = DateTime.toSeconds(
        new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      );
    }

    const nextBillingAt = DateTime.toSeconds(
      new Date(
        billingTo.getFullYear(),
        billingTo.getMonth(),
        billingTo.getDate(),
      ),
    );

    const billedAt = workspaceSubscription.billedAt || DateTime.toSeconds(now);

    const response: CalculateWorkspaceSubscriptionBillingResponse = {
      workspaceSubscriptionId: workspaceSubscription._id.toString(),
      selectedSubscription,
      billedSubscription,
      totalPrice,
      billedStat,
      billedAt,
      nextBillingAt,
    };

    return response;
  }

  async handleBillings(workspaceId: string) {
    const calculated = await this.calculateBilling({ workspaceId });
    const workspaceSubscription = await this.get(workspaceId);

    if (calculated.totalPrice !== 0) {
      if (calculated.totalPrice > 0) {
        await this.workspaceBillings.addPayment(
          mustBeObjectId(workspaceId).toString(),
          {
            amount: calculated.totalPrice,
            relatedWorkspaceSubscriptionId:
              calculated.billedStat.subscriptionId,
          },
        );
      } else {
        await this.workspaceBillings.addCashback(
          mustBeObjectId(workspaceId).toString(),
          {
            amount: calculated.totalPrice,
            relatedWorkspaceSubscriptionId:
              calculated.billedStat.subscriptionId,
          },
        );
      }

      await this.repository.update(workspaceSubscription._id, {
        billedStat: calculated.billedStat,
        billedAt: calculated.billedAt,
      });

      this.queueProducers.captureEvent({
        type: EventType.WORKSPACE_SUBSCRIPTION_UPDATED,
        actionType: EventDataActionType.UPDATE,
        workspaceId: workspaceSubscription.workspaceId,
      });
    }
  }
}
