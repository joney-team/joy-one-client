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
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
} from 'src/workspaces/workspaces.utils';
import { Between, In, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { CursorEntity } from '../database/database.cursor';
import { DatabaseService } from '../database/database.service';
import { DatabaseName, TransactionNode } from '../database/database.types';
import { safeGet, withPostgresQuery } from '../database/database.utils';
import { EventDataActionType, EventType } from '../events/events.types';
import { ProductComboEntity } from '../product-combos/entities/product-combo.entity';
import { ProductCombosService } from '../product-combos/product-combos.service';
import {
  ProductComboRef,
  ProductComboSourceType,
  ProductComboStatus,
} from '../product-combos/product-combos.types';
import { ProductStocksService } from '../product-stocks/product-stocks.service';
import { ProductEntity } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { ProductType } from '../products/products.types';
import { PromotionsService } from '../promotions/promotions.service';
import { PromotionType } from '../promotions/promotions.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { ReceiptStatus, ReceiptType } from '../receipts/receipts.types';
import { getReportTimeRange } from '../reports/reports.utils';
import { DateTime } from '../utils/date-time';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { WithWorkspaceArgs } from '../workspaces/workspaces.utils';
import { CalculateOrderInput, OrderInput } from './orders.inputs';
import { OrderEntity } from './orders.entity';
import {
  OrderColumnItem,
  OrderDiscount,
  OrderDiscountType,
  OrderItemInput,
  OrderPaymentStatus,
  OrderProductHandlerContext,
  OrdersMetricsReport,
  PayOrderInput,
} from './orders.types';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity, DatabaseName.POSTGRES)
    private readonly repository: Repository<OrderEntity>,
    @InjectRepository(CursorEntity, DatabaseName.POSTGRES)
    public readonly cursorRepository: Repository<CursorEntity>,

    private readonly products: ProductsService,
    @Inject(forwardRef(() => ReceiptsService))
    private readonly receipts: ReceiptsService,
    @Inject(forwardRef(() => ProductCombosService))
    private readonly productCombos: ProductCombosService,
    @Inject(forwardRef(() => PromotionsService))
    private readonly promotions: PromotionsService,
    private readonly productStocks: ProductStocksService,
    private readonly queueProducers: QueueProducersService,

    private readonly database: DatabaseService,
  ) {}

  async get(
    args: WithOptionalWorkspaceArgs<{ id: string; node?: TransactionNode }>,
  ) {
    const { id, member, node } = withOptionalWorkspaceArgs(args);
    return this.database.runTransaction({
      node,
      isReadonly: true,
      handler: async (ctx) => {
        const data = await ctx.manager.findOne(OrderEntity, { where: { id } });
        if (!data)
          throw new NotFoundException(AppMessage.DATA_NOT_FOUND, {
            description: id,
          });
        if (member) validateWorkspaceAccessable({ member, data });
        return data;
      },
    });
  }

  async getByCode(args: WithWorkspaceArgs<{ code: string }>) {
    const { code, member } = withWorkspaceArgs(args);
    const data = await this.repository.findOne({ where: { code } });
    if (!data) throw new NotFoundException(AppMessage.DATA_NOT_FOUND);
    if (member) validateWorkspaceAccessable({ member, data });
    return data;
  }

  async getByIds(args: WithWorkspaceArgs<{ ids: string[] }>) {
    const { ids, member } = withWorkspaceArgs(args);
    const data = await this.repository.find({ where: { id: In(ids) } });
    if (member)
      data.forEach((d) => validateWorkspaceAccessable({ member, data: d }));
    return data;
  }

  getOrderProductStockRef(ctx: OrderProductHandlerContext, supplyId?: string) {
    const member = ctx.member;
    return `${member.workspaceId}-${ctx.workspaceBranchId || 'MAIN'}-${ctx.orderId}-${ctx.product._id.toString()}-${supplyId || 'NONE'}`;
  }

  async onAddProducts(ctx: OrderProductHandlerContext) {
    const member = ctx.member;

    // Stock out product
    if (ctx.product.isStockCheck) {
      const stockRef = this.getOrderProductStockRef(ctx);
      const existingStockRecords = await this.productStocks.getRecordsByRef(
        stockRef,
        ctx.node,
      );

      await this.productStocks.revertStockOut({
        ids: existingStockRecords.map((v) => v.id),
        node: ctx.node,
        workspaceId: member.workspaceId,
      });

      await this.productStocks.stockOut({
        member,
        input: {
          ref: stockRef,
          productId: ctx.product._id.toString(),
          quantity: ctx.orderDtoItem.quantity,
          relatedOrderId: ctx.orderId,
        },
        node: ctx.node,
      });
    }

    // Stock out supplies
    if (ctx.product.supplies && ctx.product.supplies.length > 0) {
      for (const supply of ctx.product.supplies) {
        const stockRef = this.getOrderProductStockRef(
          ctx,
          supply.productId.toString(),
        );
        const existingStockRecords = await this.productStocks.getRecordsByRef(
          stockRef,
          ctx.node,
        );

        await this.productStocks.revertStockOut({
          ids: existingStockRecords.map((v) => v.id),
          node: ctx.node,
          workspaceId: member.workspaceId,
        });

        await this.productStocks.stockOut({
          member,
          input: {
            ref: stockRef,
            productId: supply.productId.toString(),
            quantity: supply.quantity * ctx.orderDtoItem.quantity,
            relatedOrderId: ctx.orderId,
            relatedProductId: ctx.product._id.toString(),
          },
          node: ctx.node,
        });
      }
    }
  }

  async onRemoveProducts(ctx: OrderProductHandlerContext) {
    // Revert stock out product
    const stockRef = this.getOrderProductStockRef(ctx);
    const existingStockRecords = await this.productStocks.getRecordsByRef(
      stockRef,
      ctx.node,
    );
    await this.productStocks.revertStockOut({
      ids: existingStockRecords.map((v) => v.id),
      node: ctx.node,
      workspaceId: ctx.member.workspaceId,
    });

    // Revert stock out supplies
    if (ctx.product.supplies && ctx.product.supplies.length > 0) {
      for (const supply of ctx.product.supplies) {
        const stockRef = this.getOrderProductStockRef(
          ctx,
          supply.productId.toString(),
        );
        const existingStockRecords = await this.productStocks.getRecordsByRef(
          stockRef,
          ctx.node,
        );
        await this.productStocks.revertStockOut({
          ids: existingStockRecords.map((v) => v.id),
          node: ctx.node,
          workspaceId: ctx.member.workspaceId,
        });
      }
    }
  }

  productHandlers: {
    [key in ProductType]?: {
      add: (
        ctx: OrderProductHandlerContext,
      ) => Promise<{ productCombos?: ProductComboEntity[] } | void>;
      remove: (ctx: OrderProductHandlerContext) => Promise<void>;
    };
  } = {
    [ProductType.COMBO]: {
      add: async (ctx: OrderProductHandlerContext) => {
        if (!ctx.product.combos) return;
        if (!ctx.customerId && ctx.isValidate)
          throw new BadRequestException(
            AppMessage.ORDER_NEED_CUSTOMER_INFORMATION,
          );

        if (ctx.customerId) {
          const productCombo = await this.productCombos.create({
            sourceType: ProductComboSourceType.ORDER,
            sourceId: ctx.orderId,
            member: ctx.member,
            input: {
              customerId: ctx.customerId,
              productId: ctx.product._id.toString(),
              refs: ctx.product.combos.map((productCombo) => {
                const productRef: ProductComboRef = {
                  productRefId: productCombo.productId,
                  quantity: productCombo.quantity * ctx.orderDtoItem.quantity,
                  productRefRevenue: 0,
                  quantityUsed: 0,
                };
                return productRef;
              }),
            },
            node: ctx.node,
          });

          return {
            productCombos: [productCombo],
          };
        }

        return {};
      },
      remove: async (ctx: OrderProductHandlerContext) => {
        await this.productCombos.removeBySource({
          member: ctx.member,
          sourceType: ProductComboSourceType.ORDER,
          sourceId: ctx.orderId,
          node: ctx.node,
        });
      },
    },
    [ProductType.PRODUCT]: {
      add: async (ctx: OrderProductHandlerContext) => {
        await this.onAddProducts(ctx);

        return {};
      },
      remove: async (ctx: OrderProductHandlerContext) => {
        await this.onRemoveProducts(ctx);
      },
    },
    [ProductType.SERVICE]: {
      add: async (ctx: OrderProductHandlerContext) => {
        await this.onAddProducts(ctx);

        return {};
      },
      remove: async (ctx: OrderProductHandlerContext) => {
        await this.onRemoveProducts(ctx);
      },
    },
  };

  getProductPrice(product: ProductEntity, dto: OrderItemInput) {
    if (
      dto.price &&
      product.minPrice &&
      product.maxPrice &&
      dto.price >= product.minPrice &&
      dto.price <= product.maxPrice
    ) {
      return dto.price;
    }

    return product.price;
  }

  async prepare(
    args: WithWorkspaceArgs<{
      input: OrderInput;
      node: TransactionNode;
      order?: OrderEntity;
      isValidate?: boolean;
    }>,
  ): Promise<OrderEntity> {
    const { input, workspaceId, member } = withWorkspaceArgs(args);

    return this.database.runTransaction({
      node: args.node,
      handler: async (ctx) => {
        // Validate
        if (args.isValidate) {
          if (input.items.length === 0) {
            throw new BadRequestException(AppMessage.ORDER_EMPTY_ITEMS);
          }
        }

        const orderId = args.order?.id ?? input.id ?? uuid();
        const order = args.order ?? new OrderEntity();

        order.id = orderId;
        order.code = args.order?.code || orderId;
        order.paymentStatus =
          args.order?.paymentStatus || OrderPaymentStatus.PROCESSING;

        const discounts: OrderDiscount[] = [];
        const products: { [productId: string]: ProductEntity } = {};
        let items: OrderColumnItem[] = [];

        const prevItems = args.order?.items || [];
        const prevDiscounts = args.order?.discounts || [];

        const directProductCombos: ProductComboEntity[] = [];
        const [productCombos, availablePromotions] = await Promise.all([
          // Fetch product combos
          Promise.all(
            [...new Set([...(input.comboIds || [])])].map(async (id) =>
              this.productCombos.get({
                id,
                node: args.node,
                workspaceId,
              }),
            ),
          ).then((list) => list.filter((v) => v.sourceId !== orderId)),
          // Fetch promotions
          this.promotions.getAvailableCustomerPromotions(
            {
              ...args,
              customerId: input.relatedCustomerId,
            },
            args.node,
          ),
          // Fetch products
          this.products
            .getByIds([...new Set([...input.items.map((v) => v.productId)])])
            .then((list) =>
              list.forEach((product) => {
                products[product._id.toString()] = product;
              }),
            ),
        ]);

        const getProduct = async (productId: string) => {
          if (!products[productId]) {
            products[productId] = await this.products.get({ id: productId });
          }

          return products[productId];
        };

        // Revert removed items
        await Promise.all(
          prevItems.map(async (item) => {
            const [product, productStock] = await Promise.all([
              getProduct(item.productId),
              this.productStocks.getProductStock({
                ...args,
                productId: item.productId,
              }),
            ]);

            const productHandlers = this.productHandlers[product.type];
            if (productHandlers) {
              await productHandlers.remove({
                orderId,
                customerId: order.relatedCustomerId,
                member,
                product,
                productStock,
                node: args.node,
                orderDtoItem: item,
                isValidate: args.isValidate,
              });
            }
          }),
        );

        // Items
        for (let dtoItem of input.items) {
          const [product, productStock] = await Promise.all([
            getProduct(dtoItem.productId),
            this.productStocks.getProductStock({
              productId: dtoItem.productId,
              member: member,
              workspace: member.workspace,
              node: args.node,
            }),
          ]);

          const productHandlers = this.productHandlers[product.type];
          if (productHandlers) {
            const result = await productHandlers.add({
              orderId,
              customerId: input.relatedCustomerId,
              member,
              product,
              productPrice: dtoItem.price,
              productStock,
              node: args.node,
              orderDtoItem: dtoItem,
              isValidate: args.isValidate,
            });

            if (result && result.productCombos)
              directProductCombos.push(...result.productCombos);
          }

          const item: OrderColumnItem = {
            ...dtoItem,
            price: this.getProductPrice(product, dtoItem),
            revenue: 0,
            revenueRate: 0,
          };

          items.push(item);
        }

        const subTotalAmount = items.reduce(
          (total, v) => total + v.price * v.quantity,
          0,
        );

        // Discount
        // ------------ Direct discount
        order.directDiscount = input.directDiscount;
        if (order.directDiscount && order.directDiscount > 0) {
          discounts.push({
            type: OrderDiscountType.DIRECT,
            amount: order.directDiscount,
          });
        }

        // ------------ Use product combos
        for (let productCombo of [...productCombos, ...directProductCombos]) {
          if (productCombo.status !== ProductComboStatus.ACTIVE) continue;

          productCombo.productRefs.forEach((comboRef) => {
            const relatedItem = items.find(
              (v) => v.productId === comboRef.productRefId,
            );
            if (!relatedItem) return;

            const relatedItemQuantity =
              relatedItem.quantity -
              discounts.reduce(
                (total, v) =>
                  total +
                  (v.productId === relatedItem.productId
                    ? v.productQuantity
                    : 0),
                0,
              );
            const comboRemainQuantity =
              comboRef.quantity - comboRef.quantityUsed;
            const quantity = Math.min(relatedItemQuantity, comboRemainQuantity);

            if (quantity > 0)
              discounts.push({
                type: OrderDiscountType.COMBO,
                productId: comboRef.productRefId,
                productQuantity: quantity,
                productComboId: productCombo.id,
                amount: relatedItem.price * quantity,
              });
          });
        }

        // ------------ Use promotions
        const promotionIds = [];
        for (let promotionId of input.promotionIds || []) {
          const promotion = availablePromotions.find(
            (v) => v.id === promotionId,
          );
          if (!promotion) continue;

          if (promotion.type === PromotionType.DISCOUNT_AMOUNT) {
            promotionIds.push(promotion.id);
            discounts.push({
              type: OrderDiscountType.PROMOTION,
              amount: promotion.value,
              promotionId: promotion.id,
            });
          }

          if (promotion.type === PromotionType.DISCOUNT_RATE) {
            promotionIds.push(promotion.id);
            discounts.push({
              type: OrderDiscountType.PROMOTION,
              amount: (subTotalAmount * promotion.value) / 100,
              promotionId: promotion.id,
            });
          }
        }

        // Calculate bill
        const discountAmount = discounts.reduce(
          (total, v) => total + v.amount,
          0,
        );
        const totalAmount = Math.max(0, subTotalAmount - discountAmount);

        // Calculate revenue
        const revenues = items.map((item) => item.price * item.quantity);
        const totalRevenue = revenues.reduce((total, v) => total + v, 0);
        const revenueRates = revenues.map((v) => v / totalRevenue);

        items = items.map((item, index) => {
          const revenueRate = Number.isNaN(+revenueRates[index])
            ? 0
            : +revenueRates[index];
          return {
            ...item,
            revenue: totalAmount * revenueRate,
            revenueRate,
          };
        });

        order.items = items;
        order.workspaceId = workspaceId;
        order.workspaceBranchId = input?.workspaceBranchId;
        order.createdByUserId = member?.userId;
        order.type = input.type;
        order.comboIds = productCombos.map((v) => v.id);
        order.promotionIds = promotionIds;
        order.discounts = discounts;
        order.assigneeUserIds = input.assigneeUserIds || [];
        order.paidAmount = 0;
        order.note = input.note;
        order.totalAmount = totalAmount;
        order.relatedCustomerId = input.relatedCustomerId ?? null;

        const relatedUserIds = [...order.assigneeUserIds];
        order.items.forEach((item) =>
          relatedUserIds.push(...(item.assigneeUserIds || [])),
        );
        order.relatedUserIds = [...new Set([...relatedUserIds])];

        await ctx.manager.save(order);

        // ----- Revert previous discounts
        await Promise.all(
          prevDiscounts.map(async (discount) => {
            if (discount.type === OrderDiscountType.COMBO) {
              await this.productCombos.revertHistoryByRef({
                member,
                comboId: discount.productComboId,
                ref: `orders-${order.id}-${discount.productId}`,
                node: args.node,
              });
            }

            if (discount.type === OrderDiscountType.PROMOTION) {
              await this.promotions.revertByRef(
                `orders-${order.id}-${discount.promotionId}`,
                args.node,
              );
            }
          }),
        );

        // ----- Use discounts
        await Promise.all(
          order.discounts.map(async (discount) => {
            if (discount.type === OrderDiscountType.COMBO) {
              await this.productCombos.use({
                member,
                id: discount.productComboId,
                input: {
                  ref: `orders-${order.id}-${discount.productId}`,
                  records: [
                    {
                      productRefId: discount.productId,
                      quantity: -discount.productQuantity,
                    },
                  ],
                },
                node: args.node,
              });
            }

            if (discount.type === OrderDiscountType.PROMOTION) {
              await this.promotions.use(
                {
                  ref: `orders-${order.id}-${discount.promotionId}`,
                  promotionId: discount.promotionId,
                  customerId: order.relatedCustomerId,
                  orderId: order.id,
                  note: `Use promotion ${discount.promotionId}`,
                },
                args.node,
              );
            }
          }),
        );

        return order;
      },
    });
  }

  async calculate(args: WithWorkspaceArgs<{ input: CalculateOrderInput }>) {
    const { input } = withWorkspaceArgs(args);
    return this.database.runTransaction({
      isReadonly: true,
      handler: async (ctx) => {
        const order = await safeGet(input.id, (id) =>
          this.get({ id, ...args, node: ctx.node }),
        );

        const prepared = await this.prepare({
          ...args,
          order,
          input: input,
          node: ctx.node,
        });

        return prepared;
      },
    });
  }

  async getNextCode(args: {
    createdAt: number;
    workspace: WorkspaceEntity;
    node: TransactionNode;
  }) {
    const { createdAt, workspace, node } = args;
    const time = DateTime.normalizeDate(createdAt);

    const monthRange = DateTime.getRange(createdAt, 'month');
    const year = time.getFullYear().toString().slice(2);
    const month = `${time.getMonth() + 1}`.padStart(2, '0');
    const prefix = `${year}${month}`;

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        const cursorRef = `orders:${args.workspace._id.toString()}`;

        const cursor =
          (await ctx.manager
            .createQueryBuilder(CursorEntity, 'cursor')
            .where('cursor.ref = :ref', { ref: cursorRef })
            .setLock('pessimistic_write')
            .getOne()) ?? new CursorEntity();

        if (cursor.pointer !== prefix) {
          cursor.ref = cursorRef;
          cursor.pointer = prefix;
          cursor.count = await ctx.manager.count(OrderEntity, {
            where: {
              workspaceId: workspace._id.toString(),
              createdAt: Between(
                DateTime.toSeconds(monthRange.start),
                DateTime.toSeconds(monthRange.end),
              ),
            },
          });
        } else {
          cursor.count = cursor.count + 1;
        }

        await ctx.save(cursor);
        return `${workspace.code}${prefix}${cursor.count + 1}`;
      },
    });
  }

  async create(
    args: WithWorkspaceArgs<{
      input: OrderInput;
      code?: string;
      createdAt?: number;
    }>,
  ) {
    const { input, member } = withWorkspaceArgs(args, {
      isRequiredMember: true,
    });

    return this.database.runTransaction({
      handler: async (ctx) => {
        if (input.items.length === 0) {
          throw new BadRequestException(AppMessage.ORDER_EMPTY_ITEMS);
        }

        const order = await this.prepare({
          ...args,
          input,
          node: ctx.node,
          isValidate: true,
        });

        order.createdAt = args.createdAt ?? DateTime.getNowInSeconds();

        order.code = await this.getNextCode({
          createdAt: order.createdAt,
          workspace: member.workspace,
          node: ctx.node,
        });

        await ctx.save(order);
        return order;
      },
      onCommitted: (order) => {
        this.queueProducers.captureEvent({
          type: EventType.ORDER_NEW,
          actionType: EventDataActionType.CREATE,
          workspaceId: order.workspaceId,
          ref: order.id,
          userId: member?.userId,
          data: this.getEventData(order),
          time: order.createdAt,
          relatedEntities: [
            { entity: AppEntity.ORDERS, id: order.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: order.relatedCustomerId },
            ...(order.relatedUserIds || []).map((v) => ({
              entity: AppEntity.USERS,
              id: v,
            })),
          ],
          persist: true,
          reportTimeRange: getReportTimeRange(order.createdAt),
        });
      },
    });
  }

  async update(
    args: WithWorkspaceArgs<{
      id: string;
      input: OrderInput;
    }>,
  ) {
    const { member, input } = withWorkspaceArgs(args, {
      isRequiredMember: true,
    });

    return this.database.runTransaction({
      handler: async (ctx) => {
        if (input.items.length === 0) {
          throw new BadRequestException(AppMessage.ORDER_EMPTY_ITEMS);
        }

        const order = await this.prepare({
          ...args,
          order: await this.get(args),
          node: ctx.node,
          isValidate: true,
        });

        await ctx.save(order);
        return order;
      },
      onCommitted: (order) => {
        this.queueProducers.captureEvent({
          workspaceId: order.workspaceId,
          type: EventType.ORDER_UPDATED,
          actionType: EventDataActionType.UPDATE,
          ref: order.id,
          userId: member?.userId,
          data: this.getEventData(order),
          persist: true,
          relatedEntities: [
            { entity: AppEntity.ORDERS, id: order.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: order.relatedCustomerId },
            ...(order.relatedUserIds || []).map((v) => ({
              entity: AppEntity.USERS,
              id: v,
            })),
          ],
          reportTimeRange: getReportTimeRange(order.updatedAt),
        });
      },
    });
  }

  async archive(
    args: WithWorkspaceArgs<{ id: string; node?: TransactionNode }>,
  ) {
    const { member, node } = withWorkspaceArgs(args);
    const order = await this.get(args);

    return this.database.runTransaction({
      node,
      handler: async (ctx) => {
        order.isArchived = true;
        await ctx.save(order);

        // Revert stock out
        const relatedStockRecords = await this.productStocks.listRecords({
          node: ctx.node,
          query: {
            relatedOrderId: order.id,
          },
          workspaceId: order.workspaceId,
        });

        await this.productStocks.revertStockOut({
          ids: relatedStockRecords.results.map((v) => v.id),
          node: ctx.node,
          workspaceId: order.workspaceId,
        });

        return order;
      },
      onCommitted: (order) => {
        this.queueProducers.captureEvent({
          workspaceId: order.workspaceId,
          type: EventType.ORDER_ARCHIVED,
          actionType: EventDataActionType.ARCHIVED,
          ref: order.id,
          userId: member?.userId,
          data: this.getEventData(order),
          persist: true,
          relatedEntities: [
            { entity: AppEntity.ORDERS, id: order.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: order.relatedCustomerId },
            ...(order.relatedUserIds || []).map((v) => ({
              entity: AppEntity.USERS,
              id: v,
            })),
          ],
          reportTimeRange: getReportTimeRange(order.updatedAt),
        });
      },
    });
  }

  async list(
    args: WithWorkspaceArgs<{ query?: any; select?: (keyof OrderEntity)[] }>,
  ) {
    const { select } = args;
    const result = await this.repository.findAndCount(
      withPostgresQuery({
        ...args,
        filterFields: [
          '_id',
          'type',
          'code',
          'paymentStatus',
          'comboIds',
          'relatedCustomerId',
          'relatedUserIds',
          'isFulfilled',
        ],
        sortFields: ['totalAmount', 'paidAmount'],
        select,
      }),
    );

    return {
      total: result[1],
      results: result[0],
    };
  }

  getEventData(order: OrderEntity) {
    return {
      id: order.id,
      code: order.code,
    };
  }

  async pay(args: WithWorkspaceArgs<{ id: string; input: PayOrderInput }>) {
    const { input, workspaceId } = withWorkspaceArgs(args);
    const order = await this.get(args);

    const orderReceipt = await this.receipts
      .list({
        query: {
          relatedOrderId: order.id,
          status: ReceiptStatus.PENDING,
          type: ReceiptType.INCOME,
        },
        workspaceId,
      })
      .then((res) => res.results[0]);

    if (orderReceipt) {
      return this.receipts.update({
        ...args,
        id: orderReceipt.id,
        input: {
          amount: input.amount,
          tipAmount: input.tipAmount,
          relatedCustomerId: order.relatedCustomerId,
        },
      });
    } else {
      return this.receipts.create({
        ...args,
        input: {
          amount: input.amount,
          type: ReceiptType.INCOME,
          relatedOrderId: order.id,
          relatedCustomerId: order.relatedCustomerId,
          assigneeUserIds: order.assigneeUserIds,
          tipAmount: input.tipAmount,
        },
      });
    }
  }

  async sync(
    args: WithOptionalWorkspaceArgs<{ id: string; initialOrder?: OrderEntity }>,
  ) {
    const { id, initialOrder } = withOptionalWorkspaceArgs(args);
    try {
      const order = initialOrder || (await this.get(args));
      let isNeedUpdate = false;

      const [relatedReceipts] = await Promise.all([
        this.receipts.list({
          query: {
            status: ReceiptStatus.PAID,
            relatedOrderId: id,
            getAll: true,
          },
          workspaceId: order.workspaceId,
        }),
      ]);

      const totalPaidAmount = relatedReceipts.results.reduce(
        (total, v) => total + v.amount,
        0,
      );
      if (totalPaidAmount !== order.paidAmount) {
        order.paidAmount = totalPaidAmount;
        isNeedUpdate = true;
      }

      const paymentStatus =
        totalPaidAmount >= order.totalAmount
          ? OrderPaymentStatus.COMPLETED
          : OrderPaymentStatus.PROCESSING;

      if (paymentStatus !== order.paymentStatus) {
        order.paymentStatus = paymentStatus;
        isNeedUpdate = true;
      }

      if (isNeedUpdate) {
        await this.repository.save(order);
        this.queueProducers.captureEvent({
          ref: order.id,
          workspaceId: order.workspaceId,
          type: EventType.ORDER_SYNCED,
          actionType: EventDataActionType.UPDATE,
          data: this.getEventData(order),
          relatedEntities: [
            { entity: AppEntity.ORDERS, id: order.id, index: true },
            { entity: AppEntity.CUSTOMERS, id: order.relatedCustomerId },
            ...(order.relatedUserIds || []).map((v) => ({
              entity: AppEntity.USERS,
              id: v,
            })),
          ],
        });
      }

      return order;
    } catch (error) {
      logger.error(error, {
        case: `Sync order failed`,
        fields: {
          orderId: id,
        },
      });
      return null;
    }
  }

  async syncAll() {
    const orders = await this.repository.find({
      where: {
        isArchived: false,
      },
    });

    for (let order of orders) {
      await this.sync({ id: order.id, workspaceId: order.workspaceId });
    }
  }

  async metricsReport(member: WorkspaceMember) {
    const { start, end } = DateTime.getRange(new Date(), 'day');

    const todayOrders = await this.repository.find({
      where: {
        workspaceId: member.workspaceId,
        createdAt: Between(DateTime.toSeconds(start), DateTime.toSeconds(end)),
      },
      select: ['id'],
    });

    const report: OrdersMetricsReport = {
      todayOrders: todayOrders.length,
    };

    return report;
  }
}
