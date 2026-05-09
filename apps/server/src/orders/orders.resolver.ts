import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ProductComboEntity } from 'src/product-combos/entities/product-combo.entity';
import { ProductCombosService } from 'src/product-combos/product-combos.service';
import { ProductsService } from 'src/products/products.service';
import { PromotionEntity } from 'src/promotions/entities/promotion.entity';
import { PromotionsService } from 'src/promotions/promotions.service';
import { Auth, Member } from '../app.decorators';
import { CustomerEntity } from '../customers/customers.entity';
import { CustomersService } from '../customers/customers.service';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { OrderEntity } from './orders.entity';
import { OrderInput } from './orders.inputs';
import { OrdersService } from './orders.service';
import { OrderItem, PayOrderInput } from './orders.types';

@ObjectType()
export class OrdersPaginated extends PaginatedResponse(OrderEntity) {}

@Resolver(() => OrderEntity)
export class OrdersResolver {
  constructor(
    private readonly service: OrdersService,
    private readonly workspaceMembers: WorkspaceMembersService,
    private readonly customers: CustomersService,
    private readonly promotions: PromotionsService,
    private readonly products: ProductsService,
    private readonly productCombos: ProductCombosService,
  ) {}

  @Query(() => OrdersPaginated)
  @Auth({ member: true })
  async getOrders(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    return this.service.list({
      member,
      query: normalizeQuery(args),
    });
  }

  @Query(() => OrderEntity)
  @Auth({ member: true })
  async getOrderById(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.get({ id, member });
  }

  @Query(() => OrderEntity)
  @Auth({ member: true })
  async getOrderByCode(
    @Member() member: WorkspaceMember,
    @Args('code') code: string,
  ) {
    return this.service.getByCode({ code, member });
  }

  @Query(() => [OrderEntity])
  @Auth({ member: true })
  async getOrdersByIds(
    @Member() member: WorkspaceMember,
    @Args('ids', { type: () => [String] }) ids: string[],
  ) {
    return this.service.getByIds({ ids, member });
  }

  @Query(() => OrderEntity)
  @Auth({ member: true })
  async calculateOrder(
    @Member() member: WorkspaceMember,
    @Args('input') input: OrderInput,
  ) {
    return this.service.calculate({ member, input });
  }

  @Mutation(() => OrderEntity)
  @Auth({ member: true })
  async createOrder(
    @Member() member: WorkspaceMember,
    @Args('input') input: OrderInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => OrderEntity)
  @Auth({ member: true })
  async updateOrder(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: OrderInput,
  ) {
    return this.service.update({ id, member, input });
  }

  @Mutation(() => String)
  @Auth({ member: true })
  async payOrder(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('amount', { type: () => Number }) amount: number,
    @Args('tipAmount', { type: () => Number, nullable: true })
    tipAmount?: number,
  ) {
    const receipt = await this.service.pay({
      id,
      member,
      input: { amount, tipAmount },
    });
    return receipt.id;
  }

  @Mutation(() => OrderEntity)
  @Auth({ member: true })
  async syncOrder(@Member() member: WorkspaceMember, @Args('id') id: string) {
    return this.service.sync({ id, member });
  }

  @Mutation(() => OrderEntity)
  @Auth({ member: true })
  async archiveOrder(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.archive({ id, member });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    name: 'createdByUser',
    nullable: true,
  })
  async resolveCreatedByUser(@Parent() order: OrderEntity) {
    if (!order.createdByUserId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: order.createdByUserId,
      workspaceId: order.workspaceId,
    });
  }

  @ResolveField(() => [WorkspaceMemberPublicInfo], { name: 'assigneeUsers' })
  async resolveAssigneeUsers(@Parent() order: OrderEntity) {
    return this.workspaceMembers.getInfoByUserIds({
      userIds: order.assigneeUserIds,
      workspaceId: order.workspaceId,
    });
  }

  @ResolveField(() => CustomerEntity, {
    name: 'relatedCustomer',
    nullable: true,
  })
  async resolveRelatedCustomer(@Parent() order: OrderEntity) {
    if (!order.relatedCustomerId) return null;
    return this.customers.get({
      id: order.relatedCustomerId,
      workspaceId: order.workspaceId,
    });
  }

  @ResolveField(() => [ProductComboEntity], { name: 'combos' })
  async resolveCombos(@Parent() order: OrderEntity) {
    if (!order.comboIds?.length) return [];
    return this.productCombos.getByIds({
      ids: order.comboIds,
      workspaceId: order.workspaceId,
    });
  }

  @ResolveField(() => [PromotionEntity], { name: 'promotions' })
  async resolvePromotions(@Parent() order: OrderEntity) {
    if (!order.promotionIds?.length) return [];
    return this.promotions.getByIds({
      ids: order.promotionIds,
      workspaceId: order.workspaceId,
    });
  }

  @ResolveField(() => [OrderItem], { name: 'items' })
  async resolveItems(@Parent() order: OrderEntity) {
    if (order.items.length === 0) return [];
    const products = await this.products.getByIds(
      order.items.map((item) => item.productId),
    );

    return Promise.all(
      order.items.map(async (item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId,
        );

        if (!product) {
          throw new Error(`Product with id ${item.productId} not found`);
        }

        return {
          ...item,
          product,
          assigneeUsers: await this.workspaceMembers.getInfoByUserIds({
            userIds: item.assigneeUserIds,
            workspaceId: order.workspaceId,
          }),
        };
      }),
    );
  }

  @ResolveField(() => String, {
    name: 'workspaceBranchId',
    nullable: true,
  })
  async resolveWorkspaceBranchId(@Parent() data: OrderEntity) {
    if (!data.workspaceBranchId) return null;
    return data.workspaceBranchId;
  }
}
