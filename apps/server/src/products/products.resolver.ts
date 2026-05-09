import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { CustomFieldValue } from 'src/custom-fields/custom-fields.types';
import { Auth, Member } from '../app.decorators';
import { CategoriesService } from '../categories/categories.service';
import { CategoryEntity } from '../categories/entities/category.entity';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import {
  ProductComboResult,
  ProductEntity,
  ProductStockResult,
  ProductSupplyResult,
} from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductInput } from './products.types';
import { ProductStocksService } from 'src/product-stocks/product-stocks.service';

@ObjectType()
export class ProductsPaginated extends PaginatedResponse(ProductEntity) {}

@Resolver(() => ProductEntity)
export class ProductsResolver {
  constructor(
    private readonly service: ProductsService,
    private readonly cateogries: CategoriesService,
    private readonly customFields: CustomFieldsService,
    private readonly productStocks: ProductStocksService,
  ) {}

  @Query(() => ProductEntity)
  @Auth({ member: true })
  async getProductById(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.get({ id, member });
  }

  @Query(() => ProductsPaginated)
  @Auth({ member: true })
  async getProducts(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ) {
    const { total: count, results: data } = await this.service.list({
      member,
      query: normalizeQuery(args),
    });

    return {
      total: count,
      results: data,
    };
  }

  @Query(() => [ProductEntity])
  @Auth({ member: true })
  async getProductsByIds(@Args('ids', { type: () => [String] }) ids: string[]) {
    return this.service.getByIds(ids);
  }

  @Query(() => ProductEntity)
  @Auth({ member: true })
  async getProduct(@Member() member: WorkspaceMember, @Args('id') id: string) {
    return this.service.get({ id, member });
  }

  @Mutation(() => ProductEntity)
  @Auth({ permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE })
  async createProduct(
    @Member() member: WorkspaceMember,
    @Args('input') input: ProductInput,
  ) {
    return this.service.create({ member, input });
  }

  @Mutation(() => ProductEntity)
  @Auth({ permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE })
  async updateProduct(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: ProductInput,
  ) {
    return this.service.update({ member, id, input });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.PRODUCTS_SERVICES_WRITE })
  async archiveProduct(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    await this.service.archive({ member, id });
    return true;
  }

  @Mutation(() => Boolean)
  @Auth()
  async interactProduct(@Args('id') id: string) {
    await this.service.interactProduct(id);
    return true;
  }

  @ResolveField(() => CategoryEntity, { name: 'category', nullable: true })
  async resolveCategory(
    @Member() member: WorkspaceMember,
    @Parent() product: ProductEntity,
  ) {
    if (!product.categoryId) return null;
    return this.cateogries.get({ id: product.categoryId, member });
  }

  @ResolveField(() => [ProductComboResult], { name: 'combos' })
  async resolveCombos(@Parent() product: ProductEntity) {
    return this.service.getCombos(product.combos);
  }

  @ResolveField(() => [ProductEntity], {
    name: 'voucherIncludeProducts',
  })
  async resolveVoucherIncludeProducts(@Parent() product: ProductEntity) {
    if (!product.voucherIncludeProductIds) return [];
    return this.service.getByIds(product.voucherIncludeProductIds);
  }

  @ResolveField(() => [ProductEntity], {
    name: 'voucherExcludeProducts',
  })
  async resolveVoucherExcludeProducts(@Parent() product: ProductEntity) {
    if (!product.voucherExcludeProductIds) return [];
    return this.service.getByIds(product.voucherExcludeProductIds);
  }

  @ResolveField(() => [ProductSupplyResult], {
    name: 'supplies',
  })
  async resolveSupplies(@Parent() product: ProductEntity) {
    if (!product.supplies) return [];
    return this.service.getSupplies(product.supplies);
  }

  @ResolveField(() => [CustomFieldValue], { name: 'customFieldValues' })
  async resolveCustomFields(@Parent() product: ProductEntity) {
    return this.customFields.bindCustomFieldValues(product);
  }

  @ResolveField(() => ProductStockResult, { name: 'stock' })
  async resolveStock(
    @Parent() product: ProductEntity,
  ): Promise<ProductStockResult> {
    const { quantity } = await this.productStocks.getProductStock({
      productId: product._id,
      workspaceId: product.workspaceId,
    });

    return { quantity };
  }
}
