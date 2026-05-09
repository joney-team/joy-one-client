import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiFile } from './tools.decorators';
import { ToolsService } from './tools.service';
import crypto from 'crypto';

@Controller('tools')
@ApiTags('Tools')
export class ToolsController {
  constructor(private readonly service: ToolsService) {}

  @Post(`/excel-to-json`)
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  async excelToJson(@UploadedFiles() files: { file: Express.Multer.File[] }) {
    return this.service.excelToJson(files.file[0]);
  }

  @Post(`/detect-qr-code`)
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  async detectQrCode(@UploadedFiles() files: { file: Express.Multer.File[] }) {
    return this.service.detectQrCode(files.file[0]);
  }

  @Post('/md5')
  async md5(@Body() dto: { text: string }) {
    const hash = crypto.createHash('md5').update(dto.text).digest('hex');

    return {
      hash,
    };
  }
}
