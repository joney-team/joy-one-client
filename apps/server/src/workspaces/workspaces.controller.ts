import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { RequestLocale } from '../app.decorators';
import { AppLocale } from '../lang/lang.types';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@ApiTags('Workspaces')
export class WorkspacesController {
  constructor(private readonly service: WorkspacesService) {}

  @Get('/:id')
  @ApiParam({ name: 'id' })
  async get(@Param() params: any) {
    return this.service.get(params.id);
  }

  @Get('/invite/:inviteCode/metadata')
  async inviteMetadata(
    @Param('inviteCode') inviteCode: string,
    @RequestLocale() locale?: AppLocale,
  ) {
    return this.service.inviteMetadata(inviteCode, locale);
  }

  @Get('/invite/:inviteCode')
  async inviteInformation(@Param('inviteCode') inviteCode: string) {
    return this.service.inviteInformation(inviteCode);
  }

  @Get('/:id/cover')
  async getCover(@Param('id') id: string, @Res() res: Response) {
    const path = await this.service.getCoverImage(id);
    const file = createReadStream(path);
    file.pipe(res);
  }

  @Get('/:id/cover.png')
  async getCoverPng(@Param('id') id: string, @Res() res: Response) {
    const path = await this.service.getCoverImage(id);
    const file = createReadStream(path);
    file.pipe(res);
  }
}
