import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  validateWorkspaceAccessable,
  withWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';
import { In, Repository } from 'typeorm';
import { AppMessage } from '../app.message';
import { CustomersService } from '../customers/customers.service';
import { DatabaseService } from '../database/database.service';
import { DatabaseName, TransactionNode } from '../database/database.types';
import {
  bindData,
  safeBindData,
  withPostgresQuery,
} from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { DateTime } from '../utils/date-time';
import { cleanObject } from '../utils/object.utils';
import { WithWorkspaceArgs } from '../workspaces/workspaces.utils';
import { ProductComboHistoryEntity } from './entities/product-combo-history.entity';
import { ProductComboEntity } from './entities/product-combo.entity';
import {
  ProductComboInput,
  ProductComboSourceType,
  ProductComboStatus,
  UseProductComboInput,
} from './product-combos.types';

@Injectable()
export class ProductCombosService {
  constructor(
    @InjectRepository(ProductComboEntity, DatabaseName.POSTGRES)
    private repository: Repository<ProductComboEntity>,
    @InjectRepository(ProductComboHistoryEntity, DatabaseName.POSTGRES)
    private repositoryHistory: Repository<ProductComboHistoryEntity>,
    private readonly products: ProductsService,
    private readonly customers: CustomersService,
    @Inject(forwardRef(() => OrdersService))
    private readonly orders: OrdersService,
    private readonly queueProducers: QueueProducersService,
    private readonly database: DatabaseService,
  ) {}

  async create(
    args: WithWorkspaceArgs<{
      sourceType: ProductComboSourceType;
      sourceId: string;
      input: ProductComboInput;
      node?: TransactionNode;
    }>,
  ) {
    const { member, workspaceId, sourceType, sourceId, input, node } =
      withWorkspaceArgs(args);

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const existed = await ctx.manager.findOne(ProductComboEntity, {
          where: cleanObject({
            sourceId,
            sourceType,
            workspaceId,
            workspaceBranchId: input.workspaceBranchId,
          }),
        });

        const combo = existed || new ProductComboEntity();

        combo.productId = input.productId;
        combo.customerId = input.customerId;
        combo.workspaceId = workspaceId;
        combo.workspaceBranchId = input.workspaceBranchId;
        combo.productRefs = input.refs;
        combo.expireAt = input.expireAt;
        combo.sourceType = sourceType;
        combo.sourceId = sourceId;
        combo.status = ProductComboStatus.ACTIVE;

        await ctx.save(combo);
        return combo;
      },
      onCommitted: (combo) => {
        this.queueProducers.captureEvent({
          actionType: EventDataActionType.CREATE,
          type: EventType.PRODUCT_COMBO_UPDATE,
          workspaceId: combo.workspaceId,
          userId: member?.userId,
          ref: combo.id,
        });
      },
    });
  }

  async bindData(combo: ProductComboEntity) {
    return bindData({
      entity: combo,
      extends: {
        customer: safeBindData({
          entity: combo,
          field: 'customerId',
          fetch: (_id) =>
            this.customers.getShortInfo({
              id: _id,
              workspaceId: combo.workspaceId,
            }),
        }),
        product: safeBindData({
          entity: combo,
          field: 'productId',
          fetch: (id) => this.products.get({ id }),
        }),
        productRefs: safeBindData({
          entity: combo,
          field: 'productRefs',
          fetch: (productRefs) =>
            Promise.all(
              productRefs.map(async (v) => ({
                ...v,
                productRef: await this.products.get({ id: v.productRefId }),
              })),
            ),
        }),
        history: safeBindData({
          entity: combo,
          field: 'id',
          fetch: (id) =>
            this.repositoryHistory.find({ where: { productComboId: id } }),
        }),
      },
    });
  }

  async get(args: WithWorkspaceArgs<{ id: string; node?: TransactionNode }>) {
    const { id, node, member, workspaceId } = withWorkspaceArgs(args);
    return this.database.runTransaction({
      node,
      isReadonly: true,
      handler: async (ctx) => {
        const [data, history] = await Promise.all([
          ctx.manager.findOne(ProductComboEntity, {
            where: { id, workspaceId },
          }),
          ctx.manager.find(ProductComboHistoryEntity, {
            where: { productComboId: id },
          }),
        ]);

        if (!data) {
          throw new NotFoundException(AppMessage.PRODUCT_COMBO_NOT_FOUND, {
            cause: { id },
          });
        }

        if (member) {
          validateWorkspaceAccessable({ member, data });
        }

        const isAvailableBySource = await this.getAvailableBySource(
          data.sourceType,
          data.sourceId,
          ctx.node,
        );

        const productRefs = data.productRefs.map((v) => {
          const used = history.reduce((total, h) => {
            const record = h.records.find(
              (u) => u.productRefId === v.productRefId,
            );
            if (!record) return total;
            return total - record.quantity;
          }, 0);

          v.quantityUsed = used;

          return v;
        });

        let status = data.status;

        const isOutOfStock = productRefs.some(
          (v) => v.quantityUsed >= v.quantity,
        );

        const isExpired =
          data.expireAt && data.expireAt < DateTime.getNowInSeconds();

        // Stock status
        if (isOutOfStock) status = ProductComboStatus.OUT_OF_STOCK;
        if (status === ProductComboStatus.OUT_OF_STOCK && !isOutOfStock)
          status = ProductComboStatus.ACTIVE;

        // Expired status
        if (isExpired) status = ProductComboStatus.EXPIRED;

        // Source status
        if (!isAvailableBySource)
          status = ProductComboStatus.SOURCE_UNAVAILABLE;

        if (
          status !== data.status ||
          JSON.stringify(productRefs) !== JSON.stringify(data.productRefs)
        ) {
          data.status = status;
          data.productRefs = productRefs;
          await this.repository.save(data);

          this.queueProducers.captureEvent({
            actionType: EventDataActionType.UPDATE,
            type: EventType.PRODUCT_COMBO_UPDATE,
            workspaceId: data.workspaceId,
            ref: data.id,
          });
        }

        return data;
      },
    });
  }

  async getHistory(args: WithWorkspaceArgs<{ productComboId: string }>) {
    const { workspaceId } = withWorkspaceArgs(args);
    return this.repositoryHistory.find({
      where: { productComboId: args.productComboId, workspaceId },
    });
  }

  async getByIds(
    args: WithWorkspaceArgs<{ ids: string[]; node?: TransactionNode }>,
  ) {
    const { ids } = withWorkspaceArgs(args);
    if (ids.length === 0) return [];

    const combos = await this.repository.find({
      where: {
        id: In(ids),
      },
      select: ['id', 'workspaceId'],
    });

    return Promise.all(
      combos.map((combo) => this.get({ ...args, id: combo.id })),
    );
  }

  async getAvailableBySource(
    sourceType: ProductComboSourceType,
    sourceId: string,
    node?: TransactionNode,
  ) {
    if (!sourceType || !sourceId) return true;

    const actions: {
      [key in ProductComboSourceType]: () => Promise<boolean>;
    } = {
      [ProductComboSourceType.ORDER]: async () => {
        try {
          const order = await this.orders.get({
            id: sourceId,
            node,
          });
          return order.isArchived !== true;
        } catch (error) {
          return false;
        }
      },
      [ProductComboSourceType.MANUAL]: async () => {
        return true;
      },
    };

    return actions[sourceType]();
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withPostgresQuery({
        ...args,
        filterFields: ['customerId', 'productId', 'status'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async use(
    args: WithWorkspaceArgs<{
      id: string;
      input: UseProductComboInput;
      node?: TransactionNode;
    }>,
  ) {
    const { member, id, input, node } = withWorkspaceArgs(args);
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const combo = await this.get({
          ...args,
          id,
          node: ctx.node,
        });
        const ref = `${input.ref}-${combo.id}`;

        const isInvalid =
          !combo ||
          combo.status !== ProductComboStatus.ACTIVE ||
          input.records.some((v) => {
            const relatedRef = combo.productRefs.find(
              (v) => v.productRefId === v.productRefId,
            );
            return (
              !relatedRef ||
              relatedRef.quantity - relatedRef.quantityUsed - v.quantity < 0
            );
          });

        if (isInvalid) {
          throw new BadRequestException(
            AppMessage.PRODUCT_COMBO_NOT_AVAILABLE,
            { cause: { id } },
          );
        }

        const existedHistory = await ctx.manager.findOne(
          ProductComboHistoryEntity,
          {
            where: {
              ref,
              productComboId: combo.id,
            },
          },
        );

        const history = existedHistory || new ProductComboHistoryEntity();

        history.workspaceId = combo.workspaceId;
        history.workspaceBranchId = combo.workspaceBranchId;
        history.ref = ref;

        history.productComboId = combo.id;
        history.records = input.records;
        history.used = input.records;
        history.orderId = input.orderId;
        history.note = input.note;
        history.createdByUserId = member?.userId;

        await ctx.save(history);
        return combo;
      },
      onCommitted: (combo) => {
        this.queueProducers.captureEvent({
          actionType: EventDataActionType.UPDATE,
          type: EventType.PRODUCT_COMBO_UPDATE,
          workspaceId: combo.workspaceId,
          ref: combo.id,
        });
      },
    });
  }

  async revertHistory(
    args: WithWorkspaceArgs<{ historyId: string; node?: TransactionNode }>,
  ) {
    const { member, historyId, node } = withWorkspaceArgs(args);
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const history = await ctx.manager.findOne(ProductComboHistoryEntity, {
          where: { id: historyId },
        });

        if (!history)
          throw new NotFoundException(
            AppMessage.PRODUCT_COMBO_HISTORY_NOT_FOUND,
            { cause: { id: historyId } },
          );

        if (member) validateWorkspaceAccessable({ member, data: history });
        await ctx.manager.delete(ProductComboHistoryEntity, { id: historyId });
        return history;
      },
      onCommitted: async (history) => {
        this.queueProducers.captureEvent({
          actionType: EventDataActionType.UPDATE,
          type: EventType.PRODUCT_COMBO_UPDATE,
          workspaceId: history.workspaceId,
          userId: member?.userId,
          ref: history.productComboId,
        });
      },
    });
  }

  async revertHistoryByRef(
    args: WithWorkspaceArgs<{
      comboId: string;
      ref: string;
      node?: TransactionNode;
    }>,
  ) {
    const { comboId, ref, node } = withWorkspaceArgs(args);
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const comboRef = `${ref}-${comboId}`;
        const history = await ctx.manager.findOne(ProductComboHistoryEntity, {
          where: { ref: comboRef },
        });

        if (!history) {
          throw new NotFoundException(
            AppMessage.PRODUCT_COMBO_HISTORY_NOT_FOUND,
            { cause: { ref } },
          );
        }

        await this.revertHistory({ ...args, historyId: history.id, node });
        return history;
      },
    });
  }

  async getByCustomer(customerId: string) {
    return await this.repository.find({
      where: {
        customerId,
        status: ProductComboStatus.ACTIVE,
      },
    });
  }

  async getBySource(
    sourceType: ProductComboSourceType,
    sourceId: string,
    node?: TransactionNode,
  ) {
    const data = await this.repository.findOne({
      where: {
        sourceId,
        sourceType,
      },
      select: ['id'],
    });

    return this.get({ id: data.id, workspaceId: data.workspaceId, node });
  }

  async remove(
    args: WithWorkspaceArgs<{ id: string; node?: TransactionNode }>,
  ) {
    const { member, node } = withWorkspaceArgs(args);
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const combo = await this.get(args);

        if (member) validateWorkspaceAccessable({ member, data: combo });

        await ctx.manager.delete(ProductComboEntity, { id: combo.id });
        await ctx.manager.delete(ProductComboHistoryEntity, {
          productComboId: combo.id,
        });
      },
    });
  }

  async removeBySource(
    args: WithWorkspaceArgs<{
      sourceType: ProductComboSourceType;
      sourceId: string;
      node?: TransactionNode;
    }>,
  ) {
    const { sourceType, sourceId, node } = withWorkspaceArgs(args);
    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const combo = await ctx.manager.findOne(ProductComboEntity, {
          where: { sourceId, sourceType },
          select: ['id'],
        });

        if (!combo) {
          throw new NotFoundException(AppMessage.PRODUCT_COMBO_NOT_FOUND, {
            cause: { sourceId, sourceType },
          });
        }

        await this.remove({ ...args, id: combo.id, node });
      },
    });
  }
}
