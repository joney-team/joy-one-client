import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { configs } from '../config/config';
import { AppMessage } from '../app.message';
import { mustBeObjectId, withMongoQuery } from '../database/database.utils';
import { cryptoDecrypt, cryptoEncrypt } from '../utils/crypto.util';
import { WorkspaceMember } from '../workspace-members/entities/workspace-member.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceSdkEntity } from './workspace-sdks.entity';
import {
  CreateWorkspaceSdkDto,
  WorkspaceSdkClients,
} from './workspace-sdks.types';
import { DatabaseName } from '../database/database.types';
import { WithOptionalWorkspaceArgs } from '../workspaces/workspaces.utils';

@Injectable()
export class WorkspaceSdksService {
  constructor(
    @InjectRepository(WorkspaceSdkEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<WorkspaceSdkEntity>,
    private readonly workspaces: WorkspacesService,
  ) {}

  clients: WorkspaceSdkClients = {};

  async list(args: WithOptionalWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(withMongoQuery(args));

    return {
      count: data[1],
      data: data[0],
    };
  }

  async bindData(sdk: WorkspaceSdkEntity) {
    const key = cryptoEncrypt(
      { id: sdk._id.toString() },
      configs.ENCRYPT_PASSWORD,
    );

    return {
      ...sdk,
      key,
    };
  }

  async create(member: WorkspaceMember, dto: CreateWorkspaceSdkDto) {
    const sdk = new WorkspaceSdkEntity();

    sdk.workspaceId = member.workspaceId;
    sdk.key = uuid();
    sdk.name = dto.name.trim();

    await this.repository.save(sdk);
    return sdk;
  }

  async get(_id: any) {
    const sdk = await this.repository.findOne({
      where: { _id: mustBeObjectId(_id) },
    });
    if (!sdk) throw new NotFoundException(AppMessage.DATA_NOT_FOUND);
    return sdk;
  }

  async remove(member: WorkspaceMember, _id: string) {
    const sdk = await this.get(_id);
    if (sdk.workspaceId !== member.workspaceId)
      throw new ForbiddenException(AppMessage.ACCESS_DENIED);
    await this.repository.remove(sdk);
  }

  async auth(key: string) {
    const parsedKey = await cryptoDecrypt(key, configs.ENCRYPT_PASSWORD);
    const sdk = await this.get(parsedKey.id);
    const workspace = await this.workspaces.get(sdk.workspaceId);

    return {
      sdk,
      workspace,
    };
  }
}
