import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CustomFieldsService } from 'src/custom-fields/custom-fields.service';
import { CustomFieldValue } from 'src/custom-fields/custom-fields.types';
import { DynamicSelection } from 'src/utils/dynamic-selection';
import { Auth, Customer, Member } from '../app.decorators';
import { CustomerEntity } from '../customers/customers.entity';
import { bindData, listBindData } from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { PromotionEntity } from './entities/promotion.entity';
import { PromotionsService } from './promotions.service';
import { PromotionInput, UpdatePromotionStatusInput } from './promotions.types';

@Controller('promotions')
export class PromotionsController {
  constructor(
    private readonly service: PromotionsService,
    private readonly customFields: CustomFieldsService,
  ) {}

  async bindData(promotion: PromotionEntity) {
    return bindData<
      {
        productsSelection?: DynamicSelection;
        customersSelection?: DynamicSelection;
        customFields?: CustomFieldValue[];
      },
      PromotionEntity
    >({
      entity: promotion,
      extends: {
        productsSelection: async (data) => {
          if (!data.productsSelection) return data.customersSelection;
          return this.service.bindDynamicSelection(data.productsSelection);
        },
        customersSelection: async (data) => {
          if (!data.customersSelection) return data.customersSelection;
          return this.service.bindDynamicSelection(data.customersSelection);
        },
        customFields: async (data) => {
          return this.customFields.bindCustomFieldValues(data);
        },
      },
    });
  }

  @Get()
  @Auth({ permission: WorkspacePermission.PROMOTIONS_VIEW })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return listBindData({
      list: async () => {
        const result = await this.service.list({ query, member });
        return {
          count: result.total,
          data: result.results,
        };
      },
      bindData: (data) => this.bindData(data),
    });
  }

  @Get('/customers')
  @Auth({ customer: true })
  async authPromotions(@Customer() customer: CustomerEntity) {
    return this.service.getAvailableCustomerPromotions({
      workspaceId: customer.workspaceId,
      customerId: customer._id.toString(),
    });
  }

  @Get('/customers/:customerId')
  @Auth({ permission: WorkspacePermission.PROMOTIONS_VIEW })
  async getAvailablePromotions(
    @Member() member: WorkspaceMember,
    @Param('customerId') customerId: string,
  ) {
    const promotions = await this.service.getAvailableCustomerPromotions({
      member,
      customerId,
    });
    return {
      count: promotions.length,
      data: promotions,
    };
  }

  @Get('/:id')
  @Auth({ permission: WorkspacePermission.PROMOTIONS_VIEW })
  async get(@Member() member: WorkspaceMember, @Param('id') id: string) {
    return this.service.get({ member, id }).then((data) => this.bindData(data));
  }

  @Post()
  @Auth({ permission: WorkspacePermission.PROMOTIONS_MANAGER })
  async create(
    @Member() member: WorkspaceMember,
    @Body() input: PromotionInput,
  ) {
    return this.service
      .create(member, input)
      .then((data) => this.bindData(data));
  }

  @Put('/:id')
  @Auth({ permission: WorkspacePermission.PROMOTIONS_MANAGER })
  async update(
    @Member() member: WorkspaceMember,
    @Param('id') id: string,
    @Body() dto: PromotionInput,
  ) {
    return this.service
      .update(member, id, dto)
      .then((data) => this.bindData(data));
  }

  @Patch('/:id/status')
  @Auth({ permission: WorkspacePermission.PROMOTIONS_MANAGER })
  async updateStatus(
    @Member() member: WorkspaceMember,
    @Param('id') id: string,
    @Body() input: UpdatePromotionStatusInput,
  ) {
    return this.service.updateStatus(member, id, input.status);
  }

  @Delete('/:id')
  @Auth({ permission: WorkspacePermission.PROMOTIONS_MANAGER })
  async delete(@Member() member: WorkspaceMember, @Param('id') id: string) {
    return this.service.archive(member, id).then((data) => this.bindData(data));
  }
}
