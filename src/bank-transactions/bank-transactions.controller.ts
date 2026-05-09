import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BankTransactionsService } from './bank-transactions.service';
import { ApiTags } from '@nestjs/swagger';
import { Auth, Member } from '../app.decorators';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import {
  BankTransactionCallbackDto,
  CreateBankTransactionDto,
} from './bank-transactions.types';

@Controller('bank-transactions')
@ApiTags('Bank Transactions')
export class BankTransactionsController {
  constructor(private readonly service: BankTransactionsService) {}

  @Post('/webhook')
  async webhook(@Body() body: any) {
    return this.service.webhook(body);
  }

  @Get('/:id')
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  @Auth({ member: true })
  async create(
    @Member() member: WorkspaceMember,
    @Body() dto: CreateBankTransactionDto,
  ) {
    return this.service.create(member, dto);
  }

  @Post('callback')
  async callback(@Body() dto: BankTransactionCallbackDto) {
    return this.service.callback(dto);
  }

  @Post('/payos/confirm-webhook')
  async payOsConfirmWebhook() {
    return this.service.payOsConfirmWebhook();
  }

  @Get('/payos/:orderId')
  async payOsGetPaymentLinkInformation(@Param('orderId') orderId: string) {
    return this.service.payOsGetPaymentLinkInformation(orderId);
  }
}
