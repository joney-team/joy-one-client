import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { AppMessage } from '../app.message';
import { DatabaseService } from '../database/database.service';
import { DatabaseName, TransactionNode } from '../database/database.types';
import {
  mustBeObjectId,
  RawObjectId,
  withPostgresQuery,
} from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { ProductsService } from '../products/products.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { cleanObject } from '../utils/object.utils';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import {
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { ProductStockRecordEntity } from './entities/product-stock-record.entity';
import { ProductStockEntity } from './entities/product-stock.entity';
import {
  BulkProductsStockInInput,
  ProductStock,
  ProductStockInInput,
  ProductStockOutInput,
  ProductStockRecordInput,
  ProductStockRecordType,
} from './product-stocks.types';

@Injectable()
export class ProductStocksService {
  constructor(
    @Inject(forwardRef(() => ProductsService))
    private readonly products: ProductsService,
    @InjectRepository(ProductStockEntity, DatabaseName.POSTGRES)
    private readonly stocksRepository: Repository<ProductStockEntity>,
    private readonly queueProducers: QueueProducersService,
    private readonly database: DatabaseService,
  ) {}

  async captureRecord(
    args: WithWorkspaceArgs<{
      stock: ProductStockEntity;
      type: ProductStockRecordType;
      input: ProductStockRecordInput;
    }>,
  ) {
    const { member } = withWorkspaceArgs(args);

    const record = new ProductStockRecordEntity();
    record.productStock = args.stock;
    record.ref = args.input.ref;
    record.type = args.type;
    record.note = args.input.note;
    record.workspaceId = args.stock.workspaceId;
    record.workspaceBranchId = args.stock.workspaceBranchId;
    record.productId = args.stock.productId;
    record.quantity =
      args.type === ProductStockRecordType.STOCK_IN
        ? Math.abs(args.input.quantity)
        : -Math.abs(args.input.quantity);

    if (member) {
      record.createdByUserId = member.userId;
    }

    if (Number.isNaN(args.input.quantity)) {
      throw new BadRequestException(AppMessage.INVALID_QUANTITY, {
        cause: args.input,
      });
    }

    record.relatedOrderId = args.input.relatedOrderId;
    record.relatedProductId = args.input.relatedProductId;
    return record;
  }

  async stockIn(
    args: WithWorkspaceArgs<{
      input: ProductStockInInput;
      node?: TransactionNode;
      ignoreEvent?: boolean;
    }>,
  ) {
    const { member, input, workspaceId } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        const stock = new ProductStockEntity();

        stock.workspaceId = workspaceId;
        stock.workspaceBranchId = member?.workspaceBranches[0]?._id.toString();
        stock.createdByUserId = member?.userId;

        stock.code = input.code;
        stock.productId = input.productId;
        stock.quantity = input.quantity;
        stock.remainQuantity = stock.quantity;
        stock.costPrice =
          typeof input.costPrice === 'number' ? input.costPrice : 0;
        stock.expireAt =
          typeof input.expireAt === 'number' ? input.expireAt : 0;
        stock.note = input.note;

        const record = await this.captureRecord({
          ...args,
          stock,
          type: ProductStockRecordType.STOCK_IN,
          input: args.input,
        });

        stock.records = [record];
        await ctx.manager.save(stock);
        return [record];
      },
      onCommitted: () => {
        if (args.ignoreEvent) return;
        this.queueProducers.captureEvent(
          {
            type: EventType.PRODUCT_STOCK_IN,
            actionType: EventDataActionType.UPDATE,
            workspaceId: member?.workspaceId,
            data: {
              dto: args.input,
            },
            userId: member?.userId,
          },
          2000,
        );
      },
    });
  }

  async revertStockIn(
    args: WithWorkspaceArgs<{ id: string; node?: TransactionNode }>,
  ) {
    const { member, workspaceId } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        const record = await ctx.manager
          .createQueryBuilder(ProductStockRecordEntity, 'record')
          .where('record.id = :id', { id: args.id })
          .setLock('pessimistic_write')
          .getOne();

        if (!record) {
          throw new NotFoundException(
            AppMessage.PRODUCT_STOCK_RECORD_NOT_FOUND,
          );
        }

        const stock = await ctx.manager
          .createQueryBuilder(ProductStockEntity, 'stock')
          .where('stock.id = :id', { id: record.productStock.id })
          .setLock('pessimistic_write')
          .getOne();

        if (!stock) {
          throw new NotFoundException(AppMessage.PRODUCT_STOCK_NOT_FOUND);
        }

        await ctx.remove(stock);
      },
      onCommitted: () => {
        this.queueProducers.captureEvent({
          type: EventType.PRODUCT_STOCK_IN_REVERT,
          actionType: EventDataActionType.UPDATE,
          workspaceId,
          data: { id: args.id },
          userId: member?.userId,
        });
      },
    });
  }

  async stockOut(
    args: WithWorkspaceArgs<{
      input: ProductStockOutInput;
      workspaceBranchId?: string;
      node?: TransactionNode;
      onBeforeStart?: () => Promise<void>;
      onBeforeCommit?: () => Promise<void>;
    }>,
  ) {
    const { workspaceId, member } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        const stocks = args.input.stockId
          ? await ctx.manager
              .createQueryBuilder(ProductStockEntity, 'stock')
              .where('stock.workspaceId = :workspaceId', {
                workspaceId,
              })
              .andWhere('stock.productId = :productId', {
                productId: args.input.productId,
              })
              .andWhere('stock.id = :id', { id: args.input.stockId })
              .andWhere('stock.remain_quantity > 0')
              .andWhere('stock.isArchived = false')
              .orderBy('stock._count', 'ASC')
              .orderBy('stock.expire_at', 'ASC')
              .setLock('pessimistic_write')
              .getMany()
          : await ctx.manager
              .createQueryBuilder(ProductStockEntity, 'stock')
              .where('stock.workspaceId = :workspaceId', {
                workspaceId,
              })
              .andWhere('stock.productId = :productId', {
                productId: args.input.productId,
              })
              .andWhere('stock.remain_quantity > 0')
              .andWhere('stock.isArchived = false')
              .orderBy('stock._count', 'ASC')
              .orderBy('stock.expire_at', 'ASC')
              .setLock('pessimistic_write')
              .getMany()
              .then((_stocks) => {
                if (args.workspaceBranchId) {
                  return _stocks.filter(
                    (stock) =>
                      stock.workspaceBranchId === args.workspaceBranchId,
                  );
                }
                return _stocks;
              });

        if (typeof args.onBeforeStart === 'function') {
          await args.onBeforeStart();
        }

        let fulfilledQuantity = 0;
        const fulfilledRecords: ProductStockRecordEntity[] = [];

        for (const stock of stocks) {
          if (fulfilledQuantity >= args.input.quantity) break;

          const availableQuantity = Math.min(
            stock.remainQuantity,
            args.input.quantity - fulfilledQuantity,
          );

          const record = await this.captureRecord({
            stock,
            type: ProductStockRecordType.STOCK_OUT,
            input: {
              quantity: availableQuantity,
              relatedOrderId: args.input.relatedOrderId,
              relatedProductId: args.input.relatedProductId,
              productId: stock.productId,
              note: args.input.note,
              ref: args.input.ref,
            },
            member,
          });

          await ctx.save(record);

          stock.remainQuantity -= availableQuantity;
          await ctx.save(stock);

          // Update fulfilled quantity
          fulfilledQuantity += availableQuantity;
          fulfilledRecords.push(record);
        }

        if (fulfilledQuantity < args.input.quantity) {
          const product = await this.products.get({ id: args.input.productId });
          throw new BadRequestException(AppMessage.PRODUCT_NAME_OUT_OF_STOCK, {
            cause: {
              productId: args.input.productId,
              productName: product.name,
            },
          });
        }

        if (typeof args.onBeforeCommit === 'function') {
          await args.onBeforeCommit();
        }

        return fulfilledRecords;
      },
      onCommitted: () => {
        this.queueProducers.captureEvent(
          {
            type: EventType.PRODUCT_STOCK_OUT,
            actionType: EventDataActionType.UPDATE,
            workspaceId: workspaceId,
            data: args.input,
            userId: member?.userId,
          },
          2000,
        );
      },
    });
  }

  async revertStockOut(
    args: WithWorkspaceArgs<{
      ids: string[];
      node?: TransactionNode;
    }>,
  ) {
    const { member, workspaceId } = withWorkspaceArgs(args);
    if (args.ids.length === 0) return;

    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        for (const id of args.ids) {
          const record = await ctx.manager
            .createQueryBuilder(ProductStockRecordEntity, 'record')
            .where('record.id = :id', { id: id })
            .setLock('pessimistic_write')
            .getOne();

          if (!record)
            throw new NotFoundException(
              AppMessage.PRODUCT_STOCK_RECORD_NOT_FOUND,
            );

          const stock = await ctx.manager
            .createQueryBuilder(ProductStockEntity, 'stock')
            .where('stock.id = :id', { id: record.productStockId })
            .setLock('pessimistic_write')
            .getOne();

          if (!stock)
            throw new NotFoundException(AppMessage.PRODUCT_STOCK_NOT_FOUND);

          stock.remainQuantity += Math.abs(record.quantity);
          await ctx.manager.remove(record);
          await ctx.manager.save(stock);
        }

        this.queueProducers.captureEvent(
          {
            type: EventType.PRODUCT_STOCK_OUT_REVERT,
            actionType: EventDataActionType.UPDATE,
            workspaceId: workspaceId,
            data: { ids: args.ids },
            userId: member?.userId,
          },
          2000,
        );
      },
    });
  }

  async listStock(
    args: WithWorkspaceArgs<{
      query?: any;
      node?: TransactionNode;
    }>,
  ) {
    return this.database.runTransaction({
      isReadonly: true,
      node: args.node,
      handler: async (ctx) => {
        const data = await ctx.manager.findAndCount(ProductStockEntity, {
          ...withPostgresQuery({
            ...args,
            filterFields: ['productId', 'code'],
            sortFields: ['costPrice', 'expireAt', 'remainQuantity'],
            filterTimeRangeFields: ['expireAt'],
          }),
          relations: {
            records: true,
          },
        });

        return {
          total: data[1],
          results: data[0],
        };
      },
    });
  }

  async listRecords(
    args?: WithWorkspaceArgs<{
      query?: any;
      node?: TransactionNode;
    }>,
  ) {
    return this.database.runTransaction({
      node: args.node,
      isReadonly: true,
      handler: async (ctx) => {
        let query = { ...args?.query };

        let findOptions = withPostgresQuery<ProductStockRecordEntity>({
          query,
          ...args,
          filterFields: [
            'productId',
            'productStockId',
            'ref',
            'type',
            'relatedOrderId',
            'relatedProductId',
          ],
        });

        const data = await ctx.manager.findAndCount(
          ProductStockRecordEntity,
          findOptions,
        );

        return {
          total: data[1],
          results: data[0],
        };
      },
    });
  }

  async getStockCode(record: ProductStockRecordEntity) {
    return this.stocksRepository
      .findOne({
        where: {
          id: record.productStockId,
        },
        select: ['code'],
      })
      .then((stock) => stock?.code);
  }

  async getRecordsByRef(ref: string, node?: TransactionNode) {
    return this.database.runTransaction({
      isReadonly: true,
      node,
      handler: async (ctx) => {
        const records = await ctx.manager.find(ProductStockRecordEntity, {
          where: { ref },
        });

        return records;
      },
    });
  }

  async getProductStock(
    args: WithWorkspaceArgs<{
      productId: RawObjectId;
      workspaceBranchId?: string;
      node?: TransactionNode;
    }>,
  ): Promise<ProductStock> {
    const { workspaceId } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      node: args.node,
      isReadonly: true,
      handler: async (ctx) => {
        const stocks = await ctx.manager.find(ProductStockEntity, {
          where: cleanObject({
            workspaceId,
            workspaceBranchId: args.workspaceBranchId,
            productId: mustBeObjectId(args.productId).toString(),
            quantity: MoreThan(0),
            isArchived: false,
          }),
          order: {
            expireAt: 'ASC',
          },
        });

        return {
          quantity: stocks.reduce(
            (acc, stock) => acc + stock.remainQuantity,
            0,
          ),
          stocks,
        };
      },
    });
  }

  async bulkProductsStockIn(
    args: WithWorkspaceArgs<{ input: BulkProductsStockInInput }>,
  ) {
    const { member, workspaceId } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      handler: async (ctx) => {
        const records: ProductStockRecordEntity[] = [];

        // Stock In
        for (const stockInDto of args.input.stocks) {
          const stockInRecords = await this.stockIn({
            ...args,
            input: stockInDto,
            node: ctx.node,
            ignoreEvent: true,
          });
          records.push(...stockInRecords);
        }

        return records;
      },
      onCommitted: () => {
        this.queueProducers.captureEvent(
          {
            type: EventType.PRODUCT_STOCK_IN_MULTIPLE,
            actionType: EventDataActionType.UPDATE,
            workspaceId,
            userId: member?.userId,
            data: {
              dto: args.input,
            },
          },
          1000,
        );
      },
    });
  }
}
