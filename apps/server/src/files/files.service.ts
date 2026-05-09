import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { exec } from 'child_process';
import { Request, Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { remove } from 'fs-extra';
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'fs/promises';
import { lookup } from 'mime-types';
import { ObjectId } from 'mongodb';
import { logger, onError } from 'src/app.logger';
import { configs } from 'src/config/config';
import {
  mustBeObjectId,
  normalizeRelatedEntities,
  withMongoQuery,
} from 'src/database/database.utils';
import { EventDataActionType, EventType } from 'src/events/events.types';
import { UserEntity } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/users.types';
import { formatBytes } from 'src/utils/file.utils';
import { WorkspaceEntity } from 'src/workspaces/entities/workspace.entity';
import { MongoRepository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { AppMessage } from '../app.message';
import { RelatedEntity } from '../database/database.entities';
import { DatabaseName } from '../database/database.types';
import { PluginExternalStorageService } from '../plugin-external-storage/plugin-external-storage.service';
import { VerifyExternalStorageDnaInput } from '../plugin-external-storage/plugin-external-storage.types';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { cryptoDecrypt, cryptoEncrypt } from '../utils/crypto.util';
import { DateTime } from '../utils/date-time';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import {
  validateWorkspaceAccessable,
  withOptionalWorkspaceArgs,
  WithOptionalWorkspaceArgs,
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { FILES_ROOT_PATH, FILES_SCHEMA } from './files.constants';
import { FileEntity } from './files.entity';
import {
  FileCapacity,
  FileDnaData,
  FileDto,
  FileType,
  FileUploadSigned,
  SignUploadInput,
  UploadExternalFileDto,
} from './files.types';
import { parseFileFromUrl } from './files.utils';

@Injectable()
export class FilesService {
  relatedFields = [
    'relatedCustomerId',
    'relatedTicketId',
    'relatedTaskId',
    'relatedReceiptId',
    'relatedHrmTimekeepingId',
    'relatedMessageId',
    'relatedProductId',
  ];

  constructor(
    @InjectRepository(FileEntity, DatabaseName.MONGO)
    private readonly respository: MongoRepository<FileEntity>,
    private readonly queueProducers: QueueProducersService,
    private readonly externalStorage: PluginExternalStorageService,
  ) {}

  async streamFileFromFilePath(args: {
    res: Response;
    req: Request;
    path: string;
  }) {
    const { res, req, path } = args;
    try {
      // Get file size
      const stats = await stat(path);
      const fileSize = stats.size;
      const mimeType = lookup(path) || 'application/octet-stream';

      // Parse range header
      const range = req?.headers?.range;

      if (range) {
        // Parse Range header (e.g., "bytes=0-1023")
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        // Validate range
        if (start >= fileSize || end >= fileSize) {
          res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
          return res.end();
        }

        // Set headers for partial content
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunkSize.toString());
        res.setHeader('Content-Type', mimeType);
        res.setHeader(
          'Cache-Control',
          `public, max-age=${configs.FILE_CACHE_TIME}`,
        );
        res.setHeader('ETag', `"${stats.mtime.getTime()}"`);

        // Create read stream with range
        const readStream = createReadStream(path, {
          start,
          end,
          highWaterMark: 256 * 1024, // 256KB
          autoClose: true,
        });

        readStream.on('error', (error) => {
          throw new ForbiddenException(AppMessage.FILE_IS_NOT_AVAILABLE, {
            cause: error,
          });
        });

        res.on('close', () => {
          readStream.destroy();
        });

        await new Promise((resolve, reject) => {
          readStream.pipe(res, { end: true });
          readStream.once('end', () => resolve(true));
          readStream.once('error', (error) => reject(error));
        });
      } else {
        // No range requested - send entire file
        res.status(200);
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', fileSize.toString());
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader(
          'Cache-Control',
          `public, max-age=${configs.FILE_CACHE_TIME}`,
        );
        res.setHeader('ETag', `"${stats.mtime.getTime()}"`);

        const readStream = createReadStream(path, {
          highWaterMark: 256 * 1024, // 256KB
          autoClose: true,
        });

        readStream.on('error', (error) => {
          throw new ForbiddenException(AppMessage.FILE_IS_NOT_AVAILABLE, {
            cause: error,
          });
        });

        res.on('close', () => {
          readStream.destroy();
        });

        await new Promise((resolve, reject) => {
          readStream.pipe(res, { end: true });
          readStream.once('end', () => resolve(true));
          readStream.once('error', (error) => reject(error));
        });
      }
    } catch (error) {
      throw new ForbiddenException(AppMessage.FILE_IS_NOT_AVAILABLE, {
        cause: error,
      });
    }
  }

  isExisted(path: string) {
    return existsSync(path);
  }

  safeGetFileId(id: string) {
    const extension = String(id).split('.').pop();
    let parsedId = String(id).replace(`.${extension}`, '').trim();

    if (parsedId.startsWith(FILES_SCHEMA)) {
      parsedId = parsedId.replace(FILES_SCHEMA, '');
    }

    return parsedId;
  }

  isInternalFileLink(raw: string): boolean {
    try {
      return raw.startsWith(FILES_SCHEMA) || raw.startsWith(configs.API_URL);
    } catch (error) {
      return false;
    }
  }

  async get(args: WithOptionalWorkspaceArgs<{ fileId: string }>) {
    const { fileId, member } = withOptionalWorkspaceArgs(args);

    const file = await this.respository.findOne({
      where: { _id: mustBeObjectId(this.safeGetFileId(fileId)) },
    });

    if (!file) {
      throw new NotFoundException(AppMessage.FILE_NOT_FOUND);
    }

    if (member) {
      validateWorkspaceAccessable({ member, data: file });
    }

    return file;
  }

  async streamFileFromFileId(args: {
    res: Response;
    req: Request;
    fileId: string;
  }) {
    const { res, req, fileId } = args;
    const file = await this.get({ fileId });

    if (file.externalUrl && file.externalUrl.startsWith('external://')) {
      const fileKey = file.externalUrl.replace('external://', '');
      return this.externalStorage.streamFile({
        fileKey,
        workspaceId: file.workspaceId,
        res,
      });
    }

    const internalFilePath = file.relativePath.startsWith('/')
      ? `${FILES_ROOT_PATH}${file.relativePath}`
      : `${FILES_ROOT_PATH}/${file.relativePath}`;

    return this.streamFileFromFilePath({ res, req, path: internalFilePath });
  }

  async getSysList() {
    const fileIds = await readdir(FILES_ROOT_PATH);
    let files: {
      name: string;
      sizeInBytes: number;
      sizeInString: string;
      url: string;
    }[] = [];

    await Promise.all(
      fileIds.map(async (fileName) => {
        const ignoreFiles = ['README.md', '.DS_Store'];
        if (ignoreFiles.includes(fileName)) return;

        const stats = await stat(`${FILES_ROOT_PATH}/${fileName}`);

        files.push({
          name: fileName,
          sizeInBytes: stats.size,
          sizeInString: formatBytes(stats.size),
          url: `${configs.API_URL}/file-manager/${fileName}`,
        });
      }),
    );

    const totalSizeInBytes = files.reduce((a, b) => a + b.sizeInBytes, 0);

    return {
      totalSizeInBytes,
      totalSizeInString: formatBytes(totalSizeInBytes),
      count: files.length,
      data: files,
    };
  }

  async prepareFolder(path: string) {
    // Check if the folder exists, if not, create it (recursively)
    if (!existsSync(path)) {
      await mkdir(path, { recursive: true });
    }
  }

  getFilePaths(
    file: Pick<
      FileEntity,
      '_id' | 'fileName' | 'workspaceId' | 'uploadByUserId'
    >,
  ) {
    const fileExtension = file.fileName.slice(
      file.fileName.lastIndexOf('.'),
      file.fileName.length,
    );

    const fileName = `${file._id.toString()}${fileExtension}`;
    const relativeFolderPath = `/${file.workspaceId ? 'workspaces' : 'users'}/${file.workspaceId || file.uploadByUserId}`;
    const relativeFilePath = `${relativeFolderPath}/${fileName}`;

    const internalFolderPath = `${FILES_ROOT_PATH}${relativeFolderPath}`;
    const internalFilePath = `${internalFolderPath}/${fileName}`;

    return {
      internalFolderPath,
      internalFilePath,
      fileName,
      relativeFolderPath,
      relativeFilePath,
    };
  }

  async upload(args: {
    user: UserEntity;
    rawFile: Express.Multer.File;
    dto: FileDto;
    workspace?: WorkspaceEntity;
  }) {
    const { user, rawFile: fileUpload, dto, workspace } = args;

    if (!fileUpload) {
      throw new BadRequestException(AppMessage.FILE_MUST_BE_PROVIDED);
    }

    // Save to database
    const file = new FileEntity();
    file._id = dto.id ? mustBeObjectId(dto.id) : new ObjectId();
    file.fileName = fileUpload.originalname;
    file.uploadByUserId = user._id.toString();
    file.size = fileUpload.size;
    file.type = this.getFileType(fileUpload.originalname);
    file.ref = dto.ref;
    file.refs = dto.refs?.toString().split(',') || [];
    file.workspaceId = workspace?._id.toString();

    file.relatedEntities = [];

    if (dto.relatedEntities) {
      try {
        const parsed = JSON.parse(dto.relatedEntities) as RelatedEntity[];
        file.relatedEntities = normalizeRelatedEntities(parsed);
      } catch (error) {
        throw new BadRequestException(AppMessage.INVALID_PAYLOAD, {
          cause: error,
        });
      }
    }

    // Write file
    const { relativeFilePath, internalFolderPath, internalFilePath } =
      this.getFilePaths(file);

    await this.prepareFolder(internalFolderPath);
    await writeFile(internalFilePath, fileUpload.buffer);

    file.path = internalFilePath;
    file.relativePath = relativeFilePath;

    await this.respository.save(file);

    if (file.workspaceId) {
      this.queueProducers.captureEvent({
        workspaceId: file.workspaceId,
        userId: user._id.toString(),
        type: EventType.FILE_NEW,
        ref: file._id.toString(),
        relatedEntities: [...file.relatedEntities],
        actionType: EventDataActionType.CREATE,
      });
    }

    return file;
  }

  async getWorkspaceCapacity(workspaceId: any): Promise<FileCapacity> {
    const folderInternalPath = `${FILES_ROOT_PATH}/workspaces/${workspaceId}`;

    const totalSizeInBytes = existsSync(folderInternalPath)
      ? await stat(folderInternalPath).then((r) => r.size)
      : 0;

    const [, filesCount] = await this.respository.findAndCount({
      where: {
        workspaceId,
      },
    });

    return {
      totalSizeInBytes: totalSizeInBytes,
      totalSizeInString: formatBytes(totalSizeInBytes),
      count: filesCount,
      limitSizeInBytes: 524288000,
    };
  }

  async removeFromRelatedPath(user: UserEntity, relativePath: string) {
    const file = await this.respository.findOne({ where: { relativePath } });
    if (!file) throw new NotFoundException(AppMessage.FILE_NOT_FOUND);
    return this.remove(user, file._id.toString());
  }

  async remove(user: UserEntity, fileId: string) {
    const file = await this.get({ fileId });

    // Validate roles
    const isAdmin = [UserRole.ADMIN, UserRole.SYS_ADMIN].includes(user.role);

    if (!isAdmin && file.uploadByUserId !== user._id.toString()) {
      throw new ForbiddenException();
    }

    if (file.path) await remove(file.path);

    await this.respository.delete(file._id);

    if (file.workspaceId) {
      this.queueProducers.captureEvent({
        workspaceId: file.workspaceId,
        actionType: EventDataActionType.ARCHIVED,
        userId: user._id.toString(),
        type: EventType.FILE_REMOVED,
        ref: file._id.toString(),
        relatedEntities: file.relatedEntities,
        persist: true,
      });
    }

    return file;
  }

  async addRelatedEntities(args: {
    id: string;
    relatedEntities: RelatedEntity[];
  }) {
    const { id } = args;
    const file = await this.get({ fileId: id });
    if (!file) throw new NotFoundException(AppMessage.FILE_NOT_FOUND);

    file.relatedEntities = file.relatedEntities || [];

    args.relatedEntities.forEach((entity) => {
      const isExisted = file.relatedEntities.some((e) => e.id === entity.id);
      if (!isExisted) file.relatedEntities.push(entity);
    });

    await this.respository.save(file);
    return file;
  }

  async list(args: WithWorkspaceArgs<{ query?: any }>) {
    const data = await this.respository.findAndCount(
      withMongoQuery({
        ...args,
        where: args.query.refs
          ? {
              refs: {
                $in: Array.isArray(args.query.refs)
                  ? args.query.refs
                  : [args.query.refs],
              },
            }
          : undefined,
        order: { createdAt: -1 },
        sortFields: ['size'],
        filterFields: ['uploadByUserId', 'type'],
      }),
    );

    return {
      total: data[1],
      results: data[0],
    };
  }

  getFileType(fileName: string): FileType {
    const file = parseFileFromUrl(fileName);
    return file.type;
  }

  async retreiveTempFile(url: string) {
    const fileName = url.split('/').pop();
    const session = uuid();
    const tempPath = `public/temp/${session}`;

    let tempfile: Buffer | undefined = undefined;
    let tempFilePath = `${tempPath}/${fileName}`;
    let tempFileName = fileName;

    if (!existsSync(tempPath)) await mkdir(tempPath);

    // Retrieve file from internal
    if (url.indexOf(configs.API_URL) !== -1) {
      const path = `${FILES_ROOT_PATH}/${fileName}`;
      if (this.isExisted(path)) {
        const internalfile: FileEntity = await this.respository
          .findOne({ where: { _id: mustBeObjectId(fileName.split('.')[0]) } })
          .catch(onError('FilesService.retreiveTempFile > findOne'));
        if (internalfile) {
          tempFilePath = tempFilePath.replace(fileName, internalfile.fileName);
          await copyFile(internalfile.path, tempFilePath);
          tempfile = await readFile(tempFilePath);
          tempFileName = internalfile.fileName;
        }
      }
    }

    // Retrieve file from external
    if (!tempfile) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const fileData = Buffer.from(response.data, 'binary');
        await writeFile(tempFilePath, fileData);
        tempfile = await readFile(tempFilePath);
      } catch (error) {
        throw new BadRequestException(`Không thể tải file từ url: ${url}`);
      }
    }

    const file = new FileEntity();
    file.fileName = tempFileName;
    file.path = tempFilePath;
    file.relativePath = '';
    file.size = tempfile.byteLength;
    file.type = this.getFileType(tempFileName);
    file.isTemp = true;
    file.tempSession = session;

    await this.respository.save(file);

    return {
      id: file._id.toString(),
      file: tempfile,
      fileName: tempFileName,
      relativePath: tempFilePath,
      url: `${configs.API_URL}/${tempFilePath.replace('public/', '')}`,
    };
  }

  async removeTempFile(id: string | ObjectId) {
    try {
      const file = await this.respository.findOne({
        where: { _id: mustBeObjectId(id) },
      });
      await rm(`public/temp/${file.tempSession}`, {
        recursive: true,
        force: true,
      });
      await this.respository.remove(file);
    } catch (error) {}
  }

  async addExternalFile(args: WithWorkspaceArgs<UploadExternalFileDto>) {
    const { url, workspaceId, member } = withWorkspaceArgs(args);
    const { fileName, type } = parseFileFromUrl(url);

    const file = new FileEntity();

    file._id = new ObjectId();
    file.workspaceId = workspaceId;
    file.uploadByUserId = member?.userId;
    file.fileName = fileName;
    file.type = type;
    file.isTemp = false;
    file.externalUrl = url;

    const { internalFilePath, internalFolderPath, relativeFilePath } =
      this.getFilePaths(file);

    file.path = internalFilePath;
    file.relativePath = relativeFilePath;

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const fileData = Buffer.from(response.data, 'binary');
    await this.prepareFolder(internalFolderPath);
    await writeFile(internalFilePath, fileData);
    file.size = fileData.byteLength;

    await this.respository.save(file);
    return file;
  }

  async moveToExternalStorage() {
    const limit = 100000;
    const chunkSize = 20;

    const files = await this.respository.find({
      where: { externalUrl: { $in: [null, ''] } },
      take: limit,
    });

    if (files.length > limit) {
      logger.info(`Too many files to move: ${files.length}`);
      return { success: false };
    }

    const chunkFiles = files.reduce<FileEntity[][]>((acc, file, index) => {
      const chunkIndex = Math.floor(index / chunkSize);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(file);
      return acc;
    }, []);

    for (const chunk of chunkFiles) {
      await Promise.all(
        chunk.map(async (file) => {
          if (!existsSync(file.path)) {
            logger.info(`File not found: ${file._id.toString()}`);
            return;
          }
          const fileBuffer = await readFile(file.path);
          const fileKey = `${file.workspaceId}/${file._id.toString()}.${file.fileName.split('.').pop()}`;

          await this.externalStorage.uploadFile({
            workspaceId: file.workspaceId,
            fileKey,
            fileBuffer,
          });

          file.externalUrl = `external://${fileKey}`;
          await this.respository.save(file);
          await remove(file.path);
          logger.info(`Moved file to external storage: ${file._id.toString()}`);
        }),
      );
    }

    logger.info(`Moved ${files.length} files to external storage`);
    return { success: true };
  }

  async convertAudio(args: {
    rawFile: Express.Multer.File;
    res: Response;
    req: Request;
  }) {
    const { rawFile, res, req } = args;
    const fileId = new ObjectId();
    const tempDir = `public/temp/${fileId}`;
    const filePath = `${tempDir}/${rawFile.fieldname}`;
    const outputFilePath = `${tempDir}/${rawFile.fieldname.split('.').pop()}.mp3`;

    // Ensure temp directory exists
    await this.prepareFolder(tempDir);
    await writeFile(filePath, rawFile.buffer);

    // Cleanup helper function with guard to prevent multiple executions
    let cleanupPromise: Promise<void> | null = null;
    const cleanup = async () => {
      if (cleanupPromise) {
        return cleanupPromise;
      }
      cleanupPromise = (async () => {
        try {
          await rm(tempDir, { recursive: true, force: true });
        } catch (error) {
          // Ignore cleanup errors
        }
      })();
      return cleanupPromise;
    };

    try {
      await new Promise((resolve, reject) => {
        exec(
          `ffmpeg -y -i "${filePath}" \
   -vn \
   -ac 1 \
   -ar 16000 \
   -af "highpass=f=80, lowpass=f=8000, afftdn, loudnorm" \
   -acodec libmp3lame \
   -ab 64k \
   "${outputFilePath}"`,
          (err) => {
            if (err) reject(err);
            else resolve(true);
          },
        );
      });

      // Set up cleanup handlers for early client disconnect
      res.once('close', cleanup);
      res.once('error', cleanup);

      // Stream output file to front-end
      try {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="converted.mp3"',
        );
        await this.streamFileFromFilePath({ res, req, path: outputFilePath });
      } finally {
        // Cleanup after streaming completes (or fails)
        await cleanup();
      }
    } catch (error) {
      // Cleanup on conversion error
      await cleanup();
      throw error;
    }
  }

  async signUpload(
    args: { input: SignUploadInput } & (
      | { member: WorkspaceMember }
      | { userId: string }
    ),
  ): Promise<FileUploadSigned> {
    const { input } = args;
    const member = 'member' in args ? args.member : undefined;
    const userId = 'userId' in args ? args.userId : undefined;

    if (!member && !userId) {
      throw new UnauthorizedException();
    }

    const externalStorage = member
      ? await this.externalStorage.get({
          member,
        })
      : null;

    if (
      member &&
      externalStorage &&
      !externalStorage.isArchived &&
      !externalStorage.isDisabled
    ) {
      const data = await this.externalStorage.signUploadUrl({
        input,
        member,
      });

      return {
        signedUrl: data.signedUrl,
        dna: data.dna,
        isUseExternalStorage: true,
      };
    }

    const fileId = input.id
      ? mustBeObjectId(input.id).toString()
      : new ObjectId().toString();

    const fileKey = member
      ? `${member.workspaceId}/${fileId}.${input.fileName.split('.').pop()}`
      : `${userId}/${fileId}.${input.fileName.split('.').pop()}`;

    const dnaData: FileDnaData = {
      workspaceId: member?.workspaceId,
      uploadByUserId: member?.userId ?? userId,
      fileId,
      fileName: input.fileName,
      fileKey,
      refs: input.refs,
      expireAt: DateTime.getNowInSeconds() + 60 * 60 * 5,
    };

    const dna = cryptoEncrypt(dnaData, configs.ENCRYPT_PASSWORD);
    const signedUrl = `${configs.API_URL}/files?dna=${dna}`;

    return {
      signedUrl,
      dna,
      isUseExternalStorage: false,
    };
  }

  async uploadWithSignedUrl(args: { dna: string; file: Express.Multer.File }) {
    const { dna, file } = args;
    const dnaData = cryptoDecrypt<FileDnaData>(dna, configs.ENCRYPT_PASSWORD);

    if (!file) {
      throw new BadRequestException(AppMessage.FILE_MUST_BE_PROVIDED);
    }

    if (!dnaData || DateTime.getNowInSeconds() > dnaData.expireAt) {
      throw new BadRequestException(AppMessage.INVALID_FILE_DNA);
    }

    const fileId = new ObjectId(dnaData.fileId);

    const isExisted = await this.respository.findOne({
      where: { _id: mustBeObjectId(fileId) },
    });

    if (isExisted) {
      throw new BadRequestException(AppMessage.FILE_ALREADY_EXISTS);
    }

    const newFile = new FileEntity();
    newFile._id = fileId;
    newFile.workspaceId = dnaData.workspaceId;
    newFile.uploadByUserId = dnaData.uploadByUserId;
    newFile.fileName = dnaData.fileName;
    newFile.type = this.getFileType(dnaData.fileName);
    newFile.refs = dnaData.refs;
    newFile.createdAt = DateTime.getNowInSeconds();
    newFile.size = file.size;

    // Write file
    const { relativeFilePath, internalFolderPath, internalFilePath } =
      this.getFilePaths(newFile);

    await this.prepareFolder(internalFolderPath);
    await writeFile(internalFilePath, file.buffer);

    newFile.path = internalFilePath;
    newFile.relativePath = relativeFilePath;

    await this.respository.save(newFile);

    return newFile;
  }

  async verifyExternalStorageDna(args: VerifyExternalStorageDnaInput) {
    const dna = await this.externalStorage.verifyDna(args);
    const fileId = new ObjectId(dna.fileId);

    const file =
      (await this.respository.findOne({
        where: { _id: fileId },
      })) ?? new FileEntity();

    file._id = fileId;
    file.uploadByUserId = dna.uploadByUserId;
    file.workspaceId = dna.workspaceId;
    file.fileName = dna.fileName;
    file.type = this.getFileType(dna.fileName);
    file.externalUrl = `external://${dna.fileKey}`;
    file.refs = dna.refs ?? [];

    await this.respository.save(file);

    return file;
  }
}
