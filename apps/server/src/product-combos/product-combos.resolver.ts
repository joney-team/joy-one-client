import {
  Args,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CustomerEntity } from 'src/customers/customers.entity';
import { CustomersService } from 'src/customers/customers.service';
import { ProductEntity } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { WorkspacePermission } from 'src/workspace-roles/workspace-roles.types';
import { Auth, Member } from '../app.decorators';
import {
  DynamicPaginatedArgs,
  normalizeQuery,
  PaginatedResponse,
} from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { ProductComboEntity } from './entities/product-combo.entity';
import { ProductCombosService } from './product-combos.service';
import {
  ProductComboRefResult,
  UseProductComboInput,
} from './product-combos.types';
import { ProductComboHistoryEntity } from './entities/product-combo-history.entity';

@ObjectType()
export class ProductCombosPaginated extends PaginatedResponse(
  ProductComboEntity,
) {}

@Resolver(() => ProductComboEntity)
export class ProductCombosResolver {
  constructor(
    private readonly service: ProductCombosService,
    private readonly products: ProductsService,
    private readonly customers: CustomersService,
  ) {}

  @Query(() => ProductCombosPaginated)
  async getProductCombos(
    @Member() member: WorkspaceMember,
    @Args() args: DynamicPaginatedArgs,
  ): Promise<ProductCombosPaginated> {
    return this.service.list({
      query: normalizeQuery(args),
      member,
    });
  }

  @Query(() => [ProductComboEntity])
  @Auth({ member: true })
  async getCustomerProductCombos(@Args('customerId') customerId: string) {
    return this.service.getByCustomer(customerId);
  }

  @Query(() => ProductComboEntity)
  @Auth({ member: true })
  async getProductCombo(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
  ) {
    return this.service.get({ id, member });
  }

  @Query(() => [ProductComboEntity])
  @Auth({ member: true })
  async getProductCombosByIds(
    @Member() member: WorkspaceMember,
    @Args('ids', { type: () => [String] }) ids: string[],
  ) {
    return this.service.getByIds({ ids, member });
  }

  @Mutation(() => ProductComboEntity)
  @Auth({ permission: WorkspacePermission.PRODUCT_COMBOS_MANAGER })
  async useProductCombo(
    @Member() member: WorkspaceMember,
    @Args('id') id: string,
    @Args('input') input: UseProductComboInput,
  ) {
    return this.service.use({ member, id, input });
  }

  @Mutation(() => Boolean)
  @Auth({ permission: WorkspacePermission.PRODUCT_COMBOS_MANAGER })
  async revertProductComboHistory(
    @Member() member: WorkspaceMember,
    @Args('historyId') historyId: string,
  ) {
    await this.service.revertHistory({ member, historyId });
    return true;
  }

  @ResolveField(() => CustomerEntity, { name: 'customer' })
  async resolveCustomer(@Parent() combo: ProductComboEntity) {
    return this.customers.get({
      id: combo.customerId,
      workspaceId: combo.workspaceId,
    });
  }

  @ResolveField(() => ProductEntity, { name: 'product' })
  async resolveProduct(@Parent() combo: ProductComboEntity) {
    return this.products.get({
      id: combo.productId,
      workspaceId: combo.workspaceId,
    });
  }

  @ResolveField(() => [ProductComboRefResult], { name: 'productRefs' })
  async resolveProductRefs(@Parent() combo: ProductComboEntity) {
    return Promise.all(
      combo.productRefs.map(async (ref) => {
        const product = await this.products.get({
          id: ref.productRefId,
          workspaceId: combo.workspaceId,
        });
        return {
          ...ref,
          product,
        };
      }),
    );
  }

  @ResolveField(() => [ProductComboHistoryEntity], { name: 'history' })
  async resolveProductHistory(@Parent() combo: ProductComboEntity) {
    return this.service.getHistory({
      productComboId: combo.id,
      workspaceId: combo.workspaceId,
    });
  }
}
