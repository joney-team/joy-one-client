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
import { ApiTags } from '@nestjs/swagger';
import { Auth, Member } from '../app.decorators';
import { listBindData } from '../database/database.utils';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { ReceiptsService } from './receipts.service';
import {
  CreateReceiptInput,
  PartialPaymentInput,
  PayReceiptInput,
  UpdateReceiptInput,
  UpdateReceiptPaidAtDto,
} from './receipts.types';
import { UserRole } from '../users/users.types';

@Controller('receipts')
@ApiTags('Receipts')
export class ReceiptsController {
  constructor(private service: ReceiptsService) {}

  @Get()
  @Auth({ member: true })
  async list(@Member() member: WorkspaceMember, @Query() query: any) {
    return listBindData({
      list: async () => {
        const { results, total } = await this.service.list({ query, member });
        return { data: results, count: total };
      },
      bindData: (data) => this.service.bindData(data),
    });
  }

  @Get('/:id')
  @Auth()
  async get(@Param('id') id: string) {
    return this.service.get({ id }).then((res) => this.service.bindData(res));
  }

  @Get('/codes/:code')
  @Auth({ member: true })
  async getByCode(
    @Param('code') code: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service
      .getByCode({ code, member })
      .then((res) => this.service.bindData(res));
  }

  @Get('/refs/:ref')
  @Auth()
  async getByRef(@Param('ref') ref: any) {
    return this.service.getByRef(ref).then((res) => this.service.bindData(res));
  }

  @Post('/:id/pay')
  @Auth({ member: true })
  async pay(
    @Member() member: WorkspaceMember,
    @Param('id') id: string,
    @Body() dto: PayReceiptInput,
  ) {
    return this.service
      .pay({ id, input: dto, member })
      .then((res) => this.service.bindData(res));
  }

  @Post('/:id/partial-payment')
  @Auth({ member: true })
  async partialPayment(
    @Member() member: WorkspaceMember,
    @Param('id') id: string,
    @Body() input: PartialPaymentInput,
  ) {
    return this.service
      .partialPayment({ member, id, input: input })
      .then(async (res) => ({
        ...res,
        receipts: await Promise.all(
          res.receipts.map((item) => this.service.bindData(item)),
        ),
      }));
  }

  @Post('/:id/disbruse')
  @Auth({ member: true })
  async disburse(
    @Member() member: WorkspaceMember,
    @Param('id') id: string,
    @Body() input: PayReceiptInput,
  ) {
    return this.service
      .disburse({ member, id, input })
      .then((res) => this.service.bindData(res));
  }

  @Post()
  @Auth({ permission: WorkspacePermission.RECEIPTS_CREATE })
  async create(
    @Member() member: WorkspaceMember,
    @Body() dto: CreateReceiptInput,
  ) {
    return this.service
      .create({ input: dto, member })
      .then((res) => this.service.bindData(res));
  }

  @Put('/:id/paid-at')
  @Auth({ permission: WorkspacePermission.RECEIPTS_UPDATE })
  async updatePaidAt(
    @Param('id') id: string,
    @Member() member: WorkspaceMember,
    @Body() dto: UpdateReceiptPaidAtDto,
  ) {
    return this.service.updatePaidAt(id, dto, member);
  }

  @Put('/:id')
  @Auth({ permission: WorkspacePermission.RECEIPTS_UPDATE })
  async update(
    @Param('id') id: string,
    @Member() member: WorkspaceMember,
    @Body() dto: UpdateReceiptInput,
  ) {
    return this.service.update({ input: dto, id, member });
  }

  @Delete('/:id')
  @Auth({ permission: WorkspacePermission.RECEIPTS_ARCHIVE })
  async archive(@Member() member: WorkspaceMember, @Param('id') id: string) {
    return this.service.archive({ id, member });
  }

  @Post('/:id/revert-payment')
  @Auth({ permission: WorkspacePermission.RECEIPTS_REVERT_PAYMENT })
  async revertPayment(
    @Member() member: WorkspaceMember,
    @Param('id') id: string,
  ) {
    return this.service.revertPayment({ id, member });
  }

  @Patch('/sync-all')
  @Auth({ userRoles: [UserRole.SYS_ADMIN] })
  async syncAllReceipts() {
    return this.service.triggerSyncAllReceipts();
  }
}
