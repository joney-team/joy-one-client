import {
  Args,
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
import { ProductStockRecordEntity } from './entities/product-stock-record.entity';

@ObjectType()
export class ProductStockRecordPaginated extends PaginatedResponse(
  ProductStockRecordEntity,
) {}

@Resolver(() => ProductStockRecordEntity)
export class ProductStockRecordsResolver {
  constructor(
    private readonly service: ProductStocksService,
    private readonly products: ProductsService,
    private readonly workspaceMembers: WorkspaceMembersService,
  ) {}

  @Query(() => ProductStockRecordPaginated)
  @Auth({ member: true })
  async getProductStockRecords(
    @Args() args: DynamicPaginatedArgs,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.listRecords({
      query: normalizeQuery(args),
      member,
    });
  }

  @ResolveField(() => ProductEntity, { name: 'product' })
  async resolveProduct(@Parent() stock: ProductStockEntity) {
    return this.products.get({ id: stock.productId });
  }

  @ResolveField(() => ProductEntity, { name: 'relatedProduct', nullable: true })
  async resolveRelatedProduct(@Parent() record: ProductStockRecordEntity) {
    if (!record.relatedProductId) return null;
    return this.products.get({ id: record.relatedProductId });
  }

  @ResolveField(() => WorkspaceMemberPublicInfo, {
    name: 'createdByUser',
    nullable: true,
  })
  async resolveCreatedByUser(@Parent() stock: ProductStockEntity) {
    if (!stock.createdByUserId) return null;
    return this.workspaceMembers.getMemberInfo({
      userId: stock.createdByUserId,
      workspaceId: stock.workspaceId,
    });
  }

  @ResolveField(() => String, { name: 'stockCode' })
  async resolveStockCode(@Parent() record: ProductStockRecordEntity) {
    return this.service.getStockCode(record);
  }
}
