import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { configs } from '../config/config';
import { DatabaseName } from '../database/database.types';
import { cryptoDecrypt, cryptoEncrypt } from '../utils/crypto.util';
import {
  withWorkspaceArgs,
  WithWorkspaceArgs,
} from '../workspaces/workspaces.utils';
import { PluginExternalStorageEntity } from './entities/plugin-external-storage.entity';
import { pluginExternalStorageProviders } from './plugin-external-storage.providers';
import {
  PluginExternalStorageSignUploadUrlInput,
  SetPluginExternalStorageInput,
  ExternalStorageFileDnaData,
  SignUploadUrlResponse,
  VerifyExternalStorageDnaInput,
} from './plugin-external-storage.types';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { mustBeObjectId } from '../database/database.utils';

@Injectable()
export class PluginExternalStorageService {
  constructor(
    @InjectRepository(PluginExternalStorageEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<PluginExternalStorageEntity>,
  ) {}

  async get(
    args: WithWorkspaceArgs,
  ): Promise<PluginExternalStorageEntity | null> {
    const { workspaceId } = withWorkspaceArgs(args);
    return this.repository.findOne({ where: { workspaceId } });
  }

  async set(args: WithWorkspaceArgs<{ input: SetPluginExternalStorageInput }>) {
    const { workspaceId, input } = withWorkspaceArgs(args);

    const existStorage = await this.get({ workspaceId });
    const storage = existStorage ?? new PluginExternalStorageEntity();

    storage.workspaceId = workspaceId;
    storage.provider = input.provider;
    storage.region = input.region ?? storage.region;
    storage.bucketName = input.bucketName ?? storage.bucketName;
    storage.endpointUrl = input.endpointUrl ?? storage.endpointUrl;

    if (input.accessKeyId) {
      storage.accessKeyId = cryptoEncrypt(
        { key: input.accessKeyId },
        configs.ENCRYPT_PASSWORD,
      );
    }

    if (input.secretAccessKey) {
      storage.secretAccessKey = cryptoEncrypt(
        { key: input.secretAccessKey },
        configs.ENCRYPT_PASSWORD,
      );
    }

    const connected =
      await pluginExternalStorageProviders[storage.provider].ping(storage);

    if (!connected) {
      throw new BadRequestException(AppMessage.EXTERNAL_STORAGE_NOT_CONNECTED);
    }

    await this.repository.save(storage);
    return storage;
  }

  async toggleDisable(args: WithWorkspaceArgs) {
    const { workspaceId } = withWorkspaceArgs(args);

    const storage = await this.repository.findOne({
      where: { workspaceId },
    });

    if (storage) {
      storage.isDisabled = !storage.isDisabled;
      await this.repository.save(storage);
      return storage.isDisabled;
    }

    return false;
  }

  async remove(args: WithWorkspaceArgs) {
    const { workspaceId } = withWorkspaceArgs(args);
    const storage = await this.repository.findOne({
      where: { workspaceId },
    });

    if (storage) {
      await this.repository.delete(storage._id);
    }

    return true;
  }

  async healthcheck(args: WithWorkspaceArgs) {
    const { workspaceId } = withWorkspaceArgs(args);
    const storage = await this.get({ workspaceId });
    if (!storage) return false;
    return pluginExternalStorageProviders[storage.provider].ping(storage);
  }

  async fetchSize(args: WithWorkspaceArgs) {
    const { workspaceId } = withWorkspaceArgs(args);
    const storage = await this.get({ workspaceId });
    if (!storage) return 0;

    const provider = pluginExternalStorageProviders[storage.provider];
    const size = await provider.getSize(storage).catch(() => null);
    storage.size = size;
    await this.repository.save(storage);
    return size;
  }

  async signUploadUrl(
    args: WithWorkspaceArgs<{ input: PluginExternalStorageSignUploadUrlInput }>,
  ): Promise<SignUploadUrlResponse> {
    const { input, member } = withWorkspaceArgs(args);
    const { fileName, refs, id } = input;

    if (!member) {
      throw new ForbiddenException();
    }

    const storage = await this.get({ workspaceId: member.workspaceId });

    if (!storage) {
      throw new BadRequestException(AppMessage.EXTERNAL_STORAGE_NOT_CONNECTED);
    }

    const fileId = id
      ? mustBeObjectId(id).toString()
      : new ObjectId().toString();

    const fileKey = `${member.workspaceId}/${fileId}.${fileName.split('.').pop()}`;

    const dnaData: ExternalStorageFileDnaData = {
      workspaceId: member.workspaceId,
      uploadByUserId: member?.userId,
      fileId,
      fileName,
      fileKey,
      refs,
    };

    const dna = cryptoEncrypt(dnaData, configs.ENCRYPT_PASSWORD);
    const provider = pluginExternalStorageProviders[storage.provider];
    const signedUrl = await provider.signUploadUrl({
      storage,
      fileKey,
    });

    return {
      signedUrl,
      dna,
    };
  }

  async streamFile(
    args: WithWorkspaceArgs<{ fileKey: string; res: Response }>,
  ) {
    const { fileKey, workspaceId, res } = withWorkspaceArgs(args);
    const storage = await this.get({ workspaceId });
    if (!storage) {
      throw new BadRequestException(AppMessage.EXTERNAL_STORAGE_NOT_CONNECTED);
    }

    return pluginExternalStorageProviders[storage.provider].streamFile({
      storage,
      fileKey,
      res,
    });
  }

  async verifyDna(
    args: VerifyExternalStorageDnaInput,
  ): Promise<ExternalStorageFileDnaData & { fileUrl: string }> {
    const dnaData = cryptoDecrypt<ExternalStorageFileDnaData>(
      args.dna,
      configs.ENCRYPT_PASSWORD,
    );

    const storage = await this.get({ workspaceId: dnaData.workspaceId });

    if (!storage) {
      throw new BadRequestException(AppMessage.EXTERNAL_STORAGE_NOT_CONNECTED);
    }

    const provider = pluginExternalStorageProviders[storage.provider];

    const fileUrl = await provider.getFileUrl({
      storage: storage,
      fileKey: dnaData.fileKey,
    });

    return {
      ...dnaData,
      fileUrl,
    };
  }

  async uploadFile(
    args: WithWorkspaceArgs<{
      fileKey: string;
      fileBuffer: Buffer<ArrayBufferLike>;
    }>,
  ) {
    const { fileKey, fileBuffer, workspaceId } = withWorkspaceArgs(args);
    const storage = await this.get({ workspaceId });
    if (!storage) {
      throw new BadRequestException(AppMessage.EXTERNAL_STORAGE_NOT_CONNECTED);
    }

    return pluginExternalStorageProviders[storage.provider].uploadFile({
      storage,
      fileKey,
      fileBuffer,
    });
  }
}
