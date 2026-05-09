import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { DatabaseService } from '../database/database.service';
import { DatabaseName, TransactionNode } from '../database/database.types';
import { withPostgresQuery } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { DateTime } from '../utils/date-time';
import {
  DynamicSelection,
  DynamicSelectionOperator,
} from '../utils/dynamic-selection';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { PromotionHistoryEntity } from './entities/promotion-history.entity';
import { PromotionEntity } from './entities/promotion.entity';
import {
  PromotionInput,
  PromotionStatus,
  UsePromotionInput,
} from './promotions.types';
import { AppEntity } from 'src/app.types';
import { ProductsService } from 'src/products/products.service';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(PromotionEntity, DatabaseName.POSTGRES)
    private readonly repository: MongoRepository<PromotionEntity>,
    private readonly queueProducers: QueueProducersService,
    private readonly database: DatabaseService,
    @Inject(forwardRef(() => ProductsService))
    private readonly products: ProductsService,
    private readonly customers: CustomersService,
  ) {}

  async get(
    args: WithOptionalWorkspaceArgs<{ id: string }>,
    node?: TransactionNode,
  ) {
    return this.database.runTransaction({
      node,
      isReadonly: true,
      handler: async (ctx) => {
        const { member, id } = withOptionalWorkspaceArgs(args);
        const promotion = await ctx.manager.findOne(PromotionEntity, {
          where: { id },
        });

        if (!promotion) throw new NotFoundException();
        if (member) validateWorkspaceAccessable({ member, data: promotion });

        return promotion;
      },
    });
  }

  async getByIds(
    args: WithWorkspaceArgs<{
      ids: string[];
      select?: (keyof PromotionEntity)[];
      node?: TransactionNode;
    }>,
  ) {
    const { ids, select, node, member } = withWorkspaceArgs(args);
    if (ids.length === 0) return [];

    return this.database.runTransaction({
      node,
      isReadonly: true,
      handler: async (ctx) => {
        const data = await ctx.manager.find(PromotionEntity, {
          where: { id: In(ids) },
          select,
        });

        if (member) {
          data.forEach((item) =>
            validateWorkspaceAccessable({ member, data: item }),
          );
        }

        return data;
      },
    });
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withPostgresQuery({
        ...args,
        filterFields: ['name', 'status', 'type'],
        sortFields: ['expireAt'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async create(
    member: WorkspaceMember,
    input: PromotionInput,
    node?: TransactionNode,
  ) {
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const promotion = new PromotionEntity();
        promotion.workspaceId = member.workspaceId;
        promotion.name = input.name;
        promotion.description = input.description;
        promotion.image = input.image;
        promotion.type = input.type;
        promotion.value = input.value;
        promotion.productsSelection = input.productsSelection;
        promotion.customersSelection = input.customersSelection;
        promotion.limitPerCustomer = input.limitPerCustomer;
        promotion.expireAt = input.expireAt ?? 0;
        promotion.status = input.status ?? PromotionStatus.ACTIVE;
        promotion.customFieldValues = input.customFieldValues;
        await this.sync(promotion, ctx.node);

        await ctx.save(promotion);

        this.queueProducers.captureEvent({
          workspaceId: member.workspaceId,
          type: EventType.PROMOTION_NEW,
          persist: true,
          actionType: EventDataActionType.CREATE,
          userId: member.userId,
          ref: promotion.id.toString(),
        });

        return promotion;
      },
    });
  }

  async update(
    member: WorkspaceMember,
    id: string,
    input: PromotionInput,
    node?: TransactionNode,
  ) {
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const promotion = await this.get({ member, id }, ctx.node);

        promotion.name = input.name;
        promotion.description = input.description;
        promotion.image = input.image;
        promotion.type = input.type;
        promotion.value = input.value;
        promotion.productsSelection = input.productsSelection;
        promotion.customersSelection = input.customersSelection;
        promotion.limitPerCustomer = input.limitPerCustomer;
        promotion.expireAt = input.expireAt ?? 0;
        promotion.status = input.status ?? promotion.status;
        promotion.customFieldValues = input.customFieldValues;

        await ctx.save(promotion);
        await this.sync(promotion, ctx.node);

        this.queueProducers.captureEvent({
          workspaceId: member.workspaceId,
          type: EventType.PROMOTION_UPDATED,
          actionType: EventDataActionType.UPDATE,
          persist: true,
          userId: member.userId,
          ref: promotion.id.toString(),
        });

        return promotion;
      },
    });
  }

  async updateStatus(
    member: WorkspaceMember,
    id: string,
    status: PromotionStatus,
    node?: TransactionNode,
  ) {
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const promotion = await this.get({ member, id }, ctx.node);
        promotion.status = status;
        await ctx.save(promotion);
        await this.sync(promotion, node);

        this.queueProducers.captureEvent({
          workspaceId: member.workspaceId,
          type: EventType.PROMOTION_UPDATED,
          actionType: EventDataActionType.UPDATE,
          persist: true,
          userId: member.userId,
          ref: promotion.id.toString(),
        });
      },
    });
  }

  async archive(member: WorkspaceMember, id: string, node?: TransactionNode) {
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const promotion = await this.get({ member, id }, ctx.node);
        promotion.isArchived = true;

        await ctx.save(promotion);

        this.queueProducers.captureEvent({
          workspaceId: member.workspaceId,
          type: EventType.PROMOTION_ARCHIVED,
          actionType: EventDataActionType.ARCHIVED,
          persist: true,
          userId: member.userId,
          ref: id,
        });

        return promotion;
      },
    });
  }

  async use(input: UsePromotionInput, node?: TransactionNode) {
    const { isAvailable, promotion } = await this.isAvailable(input, node);

    if (!isAvailable) {
      throw new BadRequestException(AppMessage.PROMOTION_NOT_AVAILABLE);
    }

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const history = new PromotionHistoryEntity();
        history.promotionId = promotion.id;
        history.customerId = input.customerId;
        history.orderId = input.orderId;
        history.ref = input.ref;
        await ctx.save(history);
        await this.sync(promotion, node);

        return history;
      },
    });
  }

  async revertByRef(ref: string, node?: TransactionNode) {
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const history = await ctx.manager.findOne(PromotionHistoryEntity, {
          where: { ref },
        });

        if (history) {
          await ctx.manager.delete(PromotionHistoryEntity, history.id);
        }
      },
    });
  }

  async isAvailable(
    dto: Omit<UsePromotionInput, 'ref'>,
    node?: TransactionNode,
  ): Promise<{ promotion: PromotionEntity; isAvailable: boolean }> {
    return this.database.runTransaction({
      node,
      isReadonly: true,
      handler: async (ctx) => {
        const now = DateTime.getNowInSeconds();
        const promotion =
          dto.promotion ||
          (await this.get({ id: dto.promotionId }, node).catch(() => null));

        if (
          // Not found
          !promotion ||
          // Archived
          promotion.isArchived ||
          // Not active
          promotion.status !== PromotionStatus.ACTIVE ||
          // Expired
          (promotion.expireAt && promotion.expireAt < now) ||
          // Customer not in include selection
          (promotion.customersSelection &&
            promotion.customersSelection.operator ===
              DynamicSelectionOperator.INCLUDES &&
            promotion.customersSelection.value.length > 0 &&
            !promotion.customersSelection.value.includes(dto.customerId)) ||
          // Customer in exclude selection
          (promotion.customersSelection &&
            promotion.customersSelection.operator ===
              DynamicSelectionOperator.EXCLUDES &&
            promotion.customersSelection.value.length > 0 &&
            promotion.customersSelection.value.includes(dto.customerId))
        ) {
          return {
            promotion,
            isAvailable: false,
          };
        }

        const history = await ctx.manager.find(PromotionHistoryEntity, {
          where: {
            promotionId: promotion.id,
            customerId: dto.customerId,
          },
        });

        if (
          promotion.limitPerCustomer &&
          history.length >= promotion.limitPerCustomer
        ) {
          return {
            promotion,
            isAvailable: false,
          };
        }

        return {
          promotion,
          isAvailable: true,
        };
      },
    });
  }

  async getAvailableCustomerPromotions(
    args: WithWorkspaceArgs<{ customerId?: string }>,
    node?: TransactionNode,
  ) {
    return this.database.runTransaction({
      node,
      isReadonly: true,
      handler: async (ctx) => {
        const { workspaceId } = withWorkspaceArgs(args);

        if (!args.customerId) {
          return [];
        }

        const promotions = await ctx.manager.find(PromotionEntity, {
          where: {
            workspaceId,
            status: PromotionStatus.ACTIVE,
          },
        });

        const available = await Promise.all(
          promotions.map((promotion) =>
            this.isAvailable(
              {
                customerId: args.customerId,
                promotionId: promotion.id,
                promotion,
              },
              node,
            ).then(({ isAvailable }) => isAvailable),
          ),
        );

        const availablePromotions = promotions.filter(
          (_, index) => available[index],
        );

        return availablePromotions;
      },
    });
  }

  async sync(promotion: string | PromotionEntity, node?: TransactionNode) {
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const _promotion =
          typeof promotion === 'string'
            ? await ctx.manager.findOne(PromotionEntity, {
                where: { id: promotion },
              })
            : promotion;

        const now = DateTime.getNowInSeconds();
        if (
          _promotion.status === PromotionStatus.ACTIVE &&
          _promotion.expireAt &&
          _promotion.expireAt > 0 &&
          _promotion.expireAt < now
        ) {
          _promotion.status = PromotionStatus.EXPIRED;
          await ctx.save(_promotion);
        }

        if (
          _promotion.status === PromotionStatus.EXPIRED &&
          _promotion.expireAt &&
          _promotion.expireAt > 0 &&
          _promotion.expireAt > now
        ) {
          _promotion.status = PromotionStatus.ACTIVE;
          await ctx.save(_promotion);
        }

        return _promotion;
      },
    });
  }

  async bindDynamicSelection(
    selection: DynamicSelection,
  ): Promise<DynamicSelection> {
    if (!selection.value) return selection;

    if (selection.entity === AppEntity.PRODUCTS) {
      return {
        ...selection,
        value: await this.products.getByIds(selection.value, [
          '_id',
          'name',
          'displayName',
          'image',
          'unit',
        ]),
      };
    }

    if (selection.entity === AppEntity.CUSTOMERS) {
      return {
        ...selection,
        value: await this.customers.getByIds(selection.value, [
          '_id',
          'name',
          'phone',
        ]),
      };
    }

    return {
      ...selection,
    };
  }
}
