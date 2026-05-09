import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { ProductEntity } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import {
  WorkspaceMember,
  WorkspaceMemberPublicInfo,
} from '../workspace-members/entities/workspace-member.entity';
import { WorkspaceMembersService } from '../workspace-members/workspace-members.service';
import { ProductStockEntity } from './entities/product-stock.entity';
import { ProductStocksService } from './product-stocks.service';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import {
  BulkProductsStockInInput,
  ProductStockInInput,
  ProductStockOutInput,
} from './product-stocks.types';

@ObjectType()
export class ProductStocksPaginated extends PaginatedResponse(
  ProductStockEntity,
) {}

@Resolver(() => ProductStockEntity)
export class ProductStocksResolver {
  constructor(
    private readonly service: ProductStocksService,
    private readonly products: ProductsService,
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  @Query(() => ProductStocksPaginated)
  @Auth({ member: true })
  async getProductStocks(
    @Args() args: DynamicPaginatedArgs,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.listStock({
      query: normalizeQuery(args),
      member,
    });
  }

  @Mutation(() => [String])
  @Auth({ permission: WorkspacePermission.PRODUCT_STOCK_IN })
  async bulkProductsStockIn(
    @Args('input') input: BulkProductsStockInInput,
    @Member() member: WorkspaceMember,
  ) {
    const records = await this.service.bulkProductsStockIn({ input, member });
    return records.map((record) => record.id);
  }

  @Mutation(() => [String])
  @Auth({ permission: WorkspacePermission.PRODUCT_STOCK_IN })
  async productStockIn(
    @Args('input') input: ProductStockInInput,
    @Member() member: WorkspaceMember,
  ) {
    const records = await this.service.stockIn({
      input,
      member,
    });
    return records.map((record) => record.id);
  }

  @Mutation(() => [String])
  @Auth({ permission: WorkspacePermission.PRODUCT_STOCK_OUT })
  async productStockOut(
    @Args('input') input: ProductStockOutInput,
    @Member() member: WorkspaceMember,
  ) {
    const records = await this.service.stockOut({
      input,
      member,
    });
    return records.map((record) => record.id);
  }

  @ResolveField(() => ProductEntity, { name: 'product' })
  async resolveProduct(@Parent() stock: ProductStockEntity) {
    return this.products.get({ id: stock.productId });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, { name: 'createdByUser' })
  async resolveCreatedByUser(@Parent() stock: ProductStockEntity) {
    return this.workspaceMembers.getMemberInfo({
      userId: stock.createdByUserId,
      workspaceId: stock.workspaceId,
    });
  }
}
