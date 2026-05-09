import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  mustBeObjectId,
  RawObjectId,
  withMongoQuery,
} from 'src/database/database.utils';
import { EventDataActionType, EventType } from 'src/events/events.types';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { DatabaseName } from '../database/database.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { DateTime } from '../utils/date-time';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { ProductEntity } from './entities/product.entity';
import {
  ProductComboValue,
  ProductInput,
  ProductSupply,
} from './products.types';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity, DatabaseName.MONGO)
    private repository: MongoRepository<ProductEntity>,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async get(
    args: WithOptionalWorkspaceArgs<{
      id: RawObjectId;
      select?: (keyof ProductEntity)[];
    }>,
  ) {
    const { id, member, select } = withOptionalWorkspaceArgs(args);

    const data = await this.repository.findOne({
      where: { _id: mustBeObjectId(id) },
      select,
    });

    if (!data) throw new NotFoundException(AppMessage.PRODUCT_NOT_FOUND);
    if (member) validateWorkspaceAccessable({ member, data });
    return data;
  }

  async getByIds(ids: any[], select?: (keyof ProductEntity)[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return [];
    const data = await this.repository.find({
      where: { _id: { $in: ids.map(mustBeObjectId) } },
      select,
    });
    return data;
  }

  async getSupplies(supplies: ProductSupply[]) {
    if (!supplies || !Array.isArray(supplies)) return [];
    return Promise.all(
      supplies.map(async (supply) => {
        const product = await this.repository.findOne({
          where: {
            _id: mustBeObjectId(supply.productId),
          },
          select: ['_id', 'name', 'displayName', 'image', 'unit'],
        });

        return {
          productId: product._id.toString(),
          product,
          amount: supply.quantity,
        };
      }),
    );
  }

  async validateSupplies(supplies?: ProductSupply[]) {
    if (!supplies || !Array.isArray(supplies)) return [];
    return Promise.all(
      supplies.map(async (supply) => {
        const product = await this.get({ id: supply.productId });

        return {
          productId: product._id.toString(),
          quantity: Math.abs(supply.quantity),
        };
      }),
    );
  }

  async getCombos(combos?: ProductComboValue[]) {
    if (!combos || !Array.isArray(combos)) return [];
    return Promise.all(
      combos.map(async (combo) => {
        const product = await this.get({ id: combo.productId });

        return {
          productId: product._id.toString(),
          product,
          quantity: combo.quantity,
        };
      }),
    );
  }

  async validateCombos(
    combos?: ProductComboValue[],
  ): Promise<ProductComboValue[]> {
    if (!combos || !Array.isArray(combos)) return [];
    return Promise.all(
      combos.map(async (combo) => {
        const product = await this.get({ id: combo.productId });
        const data: ProductComboValue = {
          productId: product._id.toString(),
          quantity: Math.abs(combo.quantity),
        };

        return data;
      }),
    );
  }

  async create(args: { member: WorkspaceMember; input: ProductInput }) {
    const { member, input } = args;
    const product = new ProductEntity();

    if (
      typeof input.maxPrice === 'number' &&
      typeof input.minPrice === 'number'
    ) {
      if (input.maxPrice < input.minPrice)
        throw new HttpException(AppMessage.INVALID_PRICE_RANGE, 400);
      if (input.price < input.minPrice || input.price > input.maxPrice)
        throw new HttpException(AppMessage.INVALID_PRICE_RANGE, 400);
      product.minPrice = input.minPrice;
      product.maxPrice = input.maxPrice;
      product.price = input.price || 0;
    } else {
      product.minPrice = null;
      product.maxPrice = null;
      product.price = input.price || 0;
    }

    product.name = input.name.trim();
    product.code = input.code;
    product.content = input.content;
    product.image = input.image;
    product.categoryId = input.categoryId || null;
    product.displayName = input.displayName?.trim();
    product.type = input.type;
    product.unit = input.unit.trim();
    product.tags = (input.tags || []).map((v) => v.trim());

    product.workspaceId = member.workspaceId;
    product.isArchived = false;
    product.isHiddenInReceiptWhenNoPrice = !!input.isHiddenInReceiptWhenNoPrice;
    product.productCode = input.productCode;
    product.defaultQtyPerUse = input.defaultQtyPerUse;
    product.customFieldValues = input.customFieldValues;

    product.isStockCheck = !!input.isStockCheck;
    product.warningOutOfDateBeforeDays = input.warningOutOfDateBeforeDays;
    product.warningOutOfStockQty = input.warningOutOfStockQty;
    product.supplies = await this.validateSupplies(input.supplies);

    // Combos
    product.combos = await this.validateCombos(input.combos);
    product.combosExpireInDays = input.combosExpireInDays;

    // Vouchers
    product.voucherAmount = input.voucherAmount;
    product.voucherExcludeProductIds = input.voucherExcludeProductIds || [];
    product.voucherIncludeProductIds = input.voucherIncludeProductIds || [];
    product.voucherExpireInDays = product.voucherExpireInDays;

    await this.repository.save(product);

    this.queueProducers.captureEvent({
      type: EventType.PRODUCT_NEW,
      actionType: EventDataActionType.CREATE,
      userId: member.userId,
      ref: product._id.toString(),
      workspaceId: product.workspaceId,
      persist: true,
      relatedEntities: [
        { entity: AppEntity.PRODUCTS, id: product._id.toString(), index: true },
      ],
    });

    return product;
  }

  async update(args: WithWorkspaceArgs<{ id: string; input: ProductInput }>) {
    const product = await this.get(args);
    const { member, input } = withWorkspaceArgs(args);

    if (
      typeof input.maxPrice === 'number' &&
      typeof input.minPrice === 'number'
    ) {
      if (input.maxPrice < input.minPrice)
        throw new HttpException(AppMessage.INVALID_PRICE_RANGE, 400);
      if (input.price < input.minPrice || input.price > input.maxPrice)
        throw new HttpException(AppMessage.INVALID_PRICE_RANGE, 400);

      product.minPrice = input.minPrice;
      product.maxPrice = input.maxPrice;
      product.price = input.price || 0;
    } else {
      product.minPrice = null;
      product.maxPrice = null;
      product.price = input.price || 0;
    }

    product.name = input.name.trim();
    product.code = input.code;
    product.content = input.content;
    product.categoryId = input.categoryId || null;
    product.displayName = input.displayName?.trim();
    product.tags = (input.tags || []).map((v) => v.trim());
    product.unit = input.unit.trim();
    product.image = input.image;

    product.type = input.type;
    product.productCode = input.productCode;
    product.defaultQtyPerUse = input.defaultQtyPerUse;

    product.isStockCheck = !!input.isStockCheck;
    product.isHiddenInReceiptWhenNoPrice = !!input.isHiddenInReceiptWhenNoPrice;
    product.warningOutOfDateBeforeDays = input.warningOutOfDateBeforeDays;
    product.warningOutOfStockQty = input.warningOutOfStockQty;
    product.customFieldValues = input.customFieldValues;
    product.supplies = await this.validateSupplies(input.supplies);

    // Combos
    product.combos = await this.validateCombos(input.combos);
    product.combosExpireInDays = input.combosExpireInDays;

    // Vouchers
    product.voucherAmount = input.voucherAmount;
    product.voucherExcludeProductIds = input.voucherExcludeProductIds || [];
    product.voucherIncludeProductIds = input.voucherIncludeProductIds || [];
    product.voucherExpireInDays = input.voucherExpireInDays;

    await this.repository.save(product);

    this.queueProducers.captureEvent({
      type: EventType.PRODUCT_UPDATE,
      actionType: EventDataActionType.UPDATE,
      ref: product._id.toString(),
      userId: member?.userId,
      persist: true,
      workspaceId: product.workspaceId,
      relatedEntities: [
        { entity: AppEntity.PRODUCTS, id: product._id.toString(), index: true },
      ],
    });

    return product;
  }

  async interactProduct(id: RawObjectId, time?: number) {
    const _time = time ?? DateTime.getNowInSeconds();
    await this.repository.update(mustBeObjectId(id), {
      lastInteractionAt: _time,
    });
    return { _id: id, _time };
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(
      withMongoQuery({
        ...args,
        filterFields: ['type', 'categoryId', 'isStockCheck'],
        sortFields: ['price', 'minPrice', 'maxPrice'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  async archive(args: WithWorkspaceArgs<{ id: RawObjectId }>) {
    const product = await this.get(args);
    const { member } = withWorkspaceArgs(args);

    product.isArchived = true;
    await this.repository.save(product);

    this.queueProducers.captureEvent({
      type: EventType.PRODUCT_ARCHIVED,
      actionType: EventDataActionType.ARCHIVED,
      userId: member?.userId,
      ref: product._id.toString(),
      persist: true,
      workspaceId: product.workspaceId,
      relatedEntities: [
        { entity: AppEntity.PRODUCTS, id: product._id.toString(), index: true },
      ],
    });

    return product;
  }

  async clearCategory(categoryId: RawObjectId) {
    const products = await this.repository.find({
      where: { categoryId: mustBeObjectId(categoryId).toString() },
    });
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      await this.repository.update(product._id, { categoryId: null });
    }
  }
}
