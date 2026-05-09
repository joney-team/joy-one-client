import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Auth, Member } from '../app.decorators';
import { ReceiptsService } from '../receipts/receipts.service';
import { UserRole } from '../users/users.types';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { CalculateOrderInput, OrderInput } from './orders.inputs';
import { OrdersService } from './orders.service';
import { PayOrderInput } from './orders.types';
import { listBindData } from '../database/database.utils';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    @Inject(forwardRef(() => ReceiptsService))
    private readonly receipts: ReceiptsService,
  ) {}

  // @Get()
  // @Auth({ requireMember: true })
  // async list(@Member() member: WorkspaceMember, @Query() query: any) {
  //   return listBindData({
  //     list: () => this.orders.list({ member, query }),
  //     bindData: (v) => this.orders.bindData(v),
  //   });
  // }

  // @Get('/ids/:id')
  // @Auth({ requireMember: true })
  // async getById(@Member() member: WorkspaceMember, @Param('id') id: string) {
  //   return this.orders.get(id, member).then((v) => this.orders.bindData(v));
  // }

  // @Get('/codes/:code')
  // @Auth({ requireMember: true })
  // async getByCode(
  //   @Member() member: WorkspaceMember,
  //   @Param('code') code: string,
  // ) {
  //   return this.orders
  //     .getByCode(code, member)
  //     .then((v) => this.orders.bindData(v));
  // }

  // @Post()
  // @Auth({ permission: WorkspacePermission.ORDERS_CREATE })
  // async create(@Member() member: WorkspaceMember, @Body() dto: OrderInput) {
  //   return this.orders
  //     .create({ dto, member })
  //     .then((v) => this.orders.bindData(v));
  // }

  // @Post('calculate')
  // @Auth({ permission: WorkspacePermission.ORDERS_CREATE })
  // async calculate(
  //   @Member() member: WorkspaceMember,
  //   @Body() dto: CalculateOrderInput,
  // ) {
  //   return this.orders.calculate(member, dto);
  // }

  // @Post(':id/pay')
  // @Auth({ requireMember: true })
  // async pay(
  //   @Member() member: WorkspaceMember,
  //   @Param('id') id: string,
  //   @Body() dto: PayOrderDto,
  // ) {
  //   return this.orders
  //     .pay(member, id, dto)
  //     .then((r) => this.receipts.get({ id: r.id }))
  //     .then((r) => this.receipts.bindData(r));
  // }

  // @Post(':id/sync')
  // @Auth({ requireMember: true })
  // async sync(@Param('id') id: string) {
  //   return this.orders.sync(id);
  // }

  // @Put(':id')
  // @Auth({ permission: WorkspacePermission.ORDERS_UPDATE })
  // async update(
  //   @Member() member: WorkspaceMember,
  //   @Param('id') id: string,
  //   @Body() dto: OrderInput,
  // ) {
  //   return this.orders
  //     .update({ member, id, dto })
  //     .then((v) => this.orders.bindData(v));
  // }

  // @Delete(':id')
  // @Auth({ permission: WorkspacePermission.ORDERS_ARCHIVE })
  // async archive(@Member() member: WorkspaceMember, @Param('id') id: string) {
  //   return this.orders.archive(id, member);
  // }

  // @Patch('sync-all')
  // @Auth({ userRoles: [UserRole.SYS_ADMIN] })
  // async syncAll() {
  //   return this.orders.syncAll();
  // }
}
