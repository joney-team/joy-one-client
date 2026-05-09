import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { join } from 'path';
import { Auth } from '../app.decorators';
import { FilesService } from '../files/files.service';
import { FileExportsService } from './file-exports.service';

@Controller('file-exports')
@ApiTags('File Exports')
export class FileExportsController {
  constructor(
    private readonly service: FileExportsService,
    private readonly files: FilesService,
  ) {}

  @Get('/:exportId/download')
  @Auth()
  async download(
    @Param('exportId') exportId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const entity = await this.service.get({ exportId });

    if (!entity.fileRelativePath) throw new NotFoundException('File not ready');

    const filePath = join(
      process.cwd(),
      entity.fileRelativePath.replace(/^\/public/, 'public'),
    );

    return this.files.streamFileFromFilePath({ res, req, path: filePath });
  }
}
