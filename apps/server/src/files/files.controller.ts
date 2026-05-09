import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Auth } from '../app.decorators';
import { UserRole } from '../users/users.types';
import { FilesService } from './files.service';
import { normalizeFileResponse } from './files.utils';

@Controller('files')
@ApiTags('Files')
export class FilesController {
  constructor(private service: FilesService) {}

  @Get('/:fileId')
  async getFile(
    @Res() res: Response,
    @Req() req: Request,
    @Param('fileId') fileId: string,
  ) {
    return this.service.streamFileFromFileId({ res, req, fileId });
  }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  async uploadWithSignedUrl(
    @Query('dna') dna: string,
    @UploadedFiles() files: { file: Express.Multer.File[] },
  ) {
    return this.service
      .uploadWithSignedUrl({ dna, file: files?.file[0] })
      .then(normalizeFileResponse);
  }

  @Post(`/convert/audio`)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  async convertAudio(
    @UploadedFiles() files: { file: Express.Multer.File[] },
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this.service.convertAudio({ rawFile: files.file[0], res, req });
  }

  @Patch('/move-to-external-storage')
  @Auth({ userRoles: [UserRole.SYS_ADMIN] })
  async moveToExternalStorage() {
    return this.service.moveToExternalStorage();
  }
}
