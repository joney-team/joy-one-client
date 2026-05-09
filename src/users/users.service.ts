import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { PayloadException } from 'src/app.exceptions';
import { configs } from 'src/config/config';
import { mustBeObjectId, withMongoQuery } from 'src/database/database.utils';
import { MongoRepository } from 'typeorm';
import { logger } from '../app.logger';
import { AppMessage } from '../app.message';
import { AppEntity } from '../app.types';
import { DatabaseName } from '../database/database.types';
import {
  EventChannel,
  EventDataActionType,
  EventType,
} from '../events/events.types';
import { FilesService } from '../files/files.service';
import { FileType } from '../files/files.types';
import {
  limitFileSize,
  limitFileTypes,
  mustFileExist,
  normalizeFileResponse,
} from '../files/files.utils';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { timeZones } from '../times/times.assets';
import { DateTime } from '../utils/date-time';
import { WithOptionalWorkspaceArgs } from '../workspaces/workspaces.utils';
import { UserEntity } from './entities/user.entity';
import { UserTokens } from './users.tokens';
import {
  CreateUserInput,
  SetUserLocaleInput,
  UpdateUserPasswordInput,
  UpdateUserProfileInput,
  UpdateUserRefCodeInput,
  UserAppDto,
  UserClients,
  UserConnectionStatus,
  UserRole,
  UserType,
} from './users.types';

@Injectable()
export class UsersService {
  clients: UserClients = {};

  constructor(
    @InjectRepository(UserEntity, DatabaseName.MONGO)
    public readonly repository: MongoRepository<UserEntity>,
    private readonly queueProducers: QueueProducersService,
    private readonly files: FilesService,
  ) {}

  getIsOnline(userId: string) {
    return Object.keys(this.clients).some(
      (key) => this.clients[key].userId === userId,
    );
  }

  async getWithCacheFromIds(ids: string[]): Promise<UserEntity[]> {
    if (!ids || !ids.length) return [];
    return Promise.all(
      [...new Set(ids)].map(async (id) =>
        this.get(id).then((r) => this.bindData(r)),
      ),
    );
  }

  async list(args: WithOptionalWorkspaceArgs<{ query?: any }>) {
    const data = await this.repository.findAndCount(withMongoQuery(args));

    return {
      count: data[1],
      data: data[0],
    };
  }

  async isExistedUsername(username: string) {
    const [user] = await Promise.all([
      this.repository.findOne({ where: { username } }),
    ]);
    return !!user;
  }

  async isExistedEmail(email: string) {
    const [user] = await Promise.all([
      this.repository.findOne({ where: { email } }),
    ]);

    return !!user;
  }

  async validatePassword(plainPassword: string) {
    if (plainPassword.length < 6)
      throw new PayloadException({
        plainPassword: AppMessage.PASSWORD_TOO_SHORT,
      });
  }

  async getByRoles(roles: UserRole[]) {
    return this.repository.find({
      where: {
        role: { $in: roles },
      },
    });
  }

  async bindData(user: UserEntity, withTokens = false) {
    const tokens = withTokens ? await UserTokens.create(user) : {};
    let _user: any = { ...user };

    const isSysAdmin = user.email === configs.SYS_ADMIN_EMAIL;
    if (isSysAdmin) _user.role = UserRole.SYS_ADMIN;

    const ignoreFields: (keyof UserEntity)[] = [
      'password',
      'authVersion',
      'updatedAt',
      'createdAt',
      'lastSignInAt',
    ];

    ignoreFields.forEach((field) => {
      delete _user[field];
    });

    _user.isPasswordProvided = !!user.password;

    return {
      ...tokens,
      ..._user,
    };
  }

  async getByUsername(username: string) {
    const _username = username.toLowerCase().trim();
    const user = await this.repository.findOne({
      where: { username: _username },
    });
    if (!user) throw new NotFoundException(AppMessage.USER_DOES_NOT_EIXSTED);
    return user;
  }

  async getByEmail(email: string) {
    const _email = email.toLowerCase().trim();
    const user = await this.repository.findOne({ where: { email: _email } });
    if (!user) throw new NotFoundException(AppMessage.USER_DOES_NOT_EIXSTED);
    return user;
  }

  async getByRole(role: UserRole) {
    return this.repository.find({
      where: {
        ['$or']: [{ role }, { email: configs.SYS_ADMIN_EMAIL }],
      },
    });
  }

  bindRoles(user: UserEntity) {
    const isSysAdmin = user.email === configs.SYS_ADMIN_EMAIL;
    if (isSysAdmin) user.role = UserRole.SYS_ADMIN;
    return user;
  }

  async hashPassword(password: string) {
    return hash(password, 10);
  }

  async comparePassword(plainPassword: string, hashedPassword: string) {
    return compare(plainPassword, hashedPassword);
  }

  async create(input: CreateUserInput) {
    const isExistedEmail = await this.isExistedEmail(input.email);
    if (isExistedEmail)
      throw new PayloadException({ email: AppMessage.EMAIL_WAS_EXISTED });

    const user = new UserEntity();
    user.email = input.email?.trim().toLowerCase();
    user.name = input.name.trim();
    user.avatar = input.avatar;
    user.authVersion = 0;
    user.settings = {};
    user.providers = [];
    user.lastSignInAt = DateTime.getNowInSeconds();

    if (input.plainPassword) {
      await this.validatePassword(input.plainPassword);
      user.password = await this.hashPassword(input.plainPassword);
    }

    await this.repository.save(user);
    return user;
  }

  async createUserApp(dto: UserAppDto) {
    const user = new UserEntity();
    user.type = UserType.APP;
    user.name = dto.name;
    user.email = dto.email;
    user.providers = [];
    user.authVersion = 0;
    user.settings = {};
    await this.repository.save(user);
    return user;
  }

  async syncWithAuthProvider(account: {
    email: string;
    uid: string;
    name?: string;
    avatar?: string;
    phone?: string;
    emailVerified?: boolean;
    provider?: string;
    username?: string;
  }) {
    if (!account.email || !account.uid)
      throw new BadRequestException(
        AppMessage.UNABLE_TO_VERIFY_YOUR_INFORMATION,
      );

    const user = await this.getByEmail(account.email).catch(() => {
      const newUser = new UserEntity();
      newUser.authVersion = 0;
      newUser.settings = {};
      return newUser;
    });

    const provider = account.provider;

    user.providers = (user.providers || []).filter(
      (p) => p.providerId !== provider,
    );
    user.providers.push({
      uid: account.uid,
      providerId: provider,
      username: account.username,
    });

    user.isEmailVerified = !!account.emailVerified;
    user.provider = provider;
    user.name = user.name || account.name;
    user.email = account.email;
    user.phone = user.phone || account.phone;
    user.avatar = user.avatar || account.avatar;

    await this.repository.save(user);
    return user;
  }

  async updateLastSignIn(user: UserEntity) {
    try {
      await this.repository.update(user._id, {
        lastSignInAt: DateTime.getNowInSeconds(),
      });
    } catch (error) {
      logger.error(error, {
        case: `Update last sign in failed.`,
        fields: {
          UserName: user.name,
          UserId: user._id,
        },
      });
    }
  }

  async get(_id: any) {
    const user = await this.repository.findOne({
      where: { _id: mustBeObjectId(_id) },
    });
    if (!user) throw new NotFoundException(AppMessage.USER_NOT_FOUND);
    return user;
  }

  async updateProfile(user: UserEntity, input: UpdateUserProfileInput) {
    user.name = input.name || null;
    user.avatar = input.avatar;
    user.birthday = input.birthday || null;
    user.phone = input.phone?.trim() || null;
    user.email = input.email?.toLowerCase().trim() || user.email;
    user.color = input.color;
    user.settings = input.settings;
    user.settings.timezoneUtc =
      timeZones.find((v) => v.id === input.settings.timezoneId)?.utc[0] || null;

    await this.repository.save(user);

    this.queueProducers.captureEvent({
      type: EventType.USER_PROFILE_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: user.activatedWorkspaceId,
      ref: user._id.toString(),
      userId: user._id.toString(),
      relatedEntities: [
        { entity: AppEntity.USERS, id: user._id.toString(), index: true },
      ],
    });

    return user;
  }

  async setActivatedWorkspace(userId: string, workspaceId: string) {
    await this.repository.update(userId, { activatedWorkspaceId: workspaceId });
    return this.get(userId);
  }

  async unsetActivatedWorkspace(userId: string) {
    await this.repository.update(userId, { activatedWorkspaceId: null });
    return this.get(userId);
  }

  async setLocale(user: UserEntity, input: SetUserLocaleInput) {
    await this.repository.update(user._id, {
      locale: input.locale || null,
      settings: {
        ...user.settings,
        locale: input.locale || null,
      },
    });

    return { locale: input.locale };
  }

  getAllClients(workspaceId: string) {
    const workspaceClients = Object.keys(this.clients)
      .map((key) => ({ socketId: key, ...this.clients[key] }))
      .filter((v) => v.workspaceId === workspaceId)
      .reduce((output, item) => {
        output[item.socketId] = { ...item };
        return output;
      }, {});

    return workspaceClients;
  }

  getClientsByUserId(userId: string) {
    return Object.keys(this.clients)
      .map((key) => ({ socketId: key, ...this.clients[key] }))
      .filter((v) => v.userId === userId);
  }

  async updatePassword(user: UserEntity, input: UpdateUserPasswordInput) {
    await this.validatePassword(input.plainPassword);

    if (user.password) {
      const isCorrectPassword = await this.comparePassword(
        input.password,
        user.password,
      );

      if (!isCorrectPassword) {
        throw new PayloadException({ password: AppMessage.PASSWORD_INCORRECT });
      }
    }

    return this.handleUpdatePassword(user, input.plainPassword);
  }

  async handleUpdatePassword(user: UserEntity, plainPassword: string) {
    const password = await this.hashPassword(plainPassword);
    await this.repository.update(user._id, { password });

    return {
      success: true,
    };
  }

  async getByRefCode(refCode: string) {
    const user = await this.repository.findOne({ where: { refCode } });
    if (!user) throw new NotFoundException(AppMessage.USER_NOT_FOUND);
    return user;
  }

  async updateRefCode(user: UserEntity, input: UpdateUserRefCodeInput) {
    const isExisted = await this.repository.findOne({
      where: { refCode: input.refCode },
    });

    if (isExisted) {
      throw new PayloadException({ refCode: AppMessage.USER_REF_CODE_EXISTED });
    }

    await this.repository.update(user._id, { refCode: input.refCode });
    return { refCode: input.refCode };
  }

  async increaseAuthVersion(user: UserEntity) {
    user.authVersion++;
    await this.repository.update(user._id, { authVersion: user.authVersion });
    return user;
  }

  async setConnectionStatus(userId: string, status: UserConnectionStatus) {
    await this.repository.update(mustBeObjectId(userId), {
      connectionStatus: status,
    });
  }

  async uploadAvatar({
    user,
    rawFile,
  }: {
    user: UserEntity;
    rawFile: Express.Multer.File;
  }) {
    mustFileExist(rawFile);
    limitFileSize(rawFile, 1);
    limitFileTypes(rawFile, [FileType.PHOTO]);

    const file = await this.files
      .upload({
        user,
        rawFile,
        dto: {
          ref: `user-avatar-${user._id.toString()}`,
          relatedEntities: JSON.stringify([
            { entity: AppEntity.USERS, id: user._id.toString() },
          ]),
        },
      })
      .then(normalizeFileResponse);

    // Remove old avatar
    if (this.files.isInternalFileLink(user.avatar)) {
      await this.files.remove(user, user.avatar);
    }

    user.avatar = file.path;
    await this.repository.update(user._id, { avatar: user.avatar });

    this.queueProducers.captureEvent({
      type: EventType.USER_PROFILE_UPDATED,
      actionType: EventDataActionType.UPDATE,
      workspaceId: user.activatedWorkspaceId,
      ref: user._id.toString(),
      userId: user._id.toString(),
      relatedEntities: [
        { entity: AppEntity.USERS, id: user._id.toString(), index: true },
      ],
    });

    return user;
  }

  async online(userId: string) {
    await this.setConnectionStatus(userId, UserConnectionStatus.ONLINE);
    this.queueProducers.captureEvent({
      channel: EventChannel.NONE,
      type: EventType.USER_ONLINE,
      userId,
    });
  }

  async offline(userId: string) {
    await this.setConnectionStatus(userId, UserConnectionStatus.OFFLINE);
    this.queueProducers.captureEvent({
      channel: EventChannel.NONE,
      type: EventType.USER_OFFLINE,
      userId,
    });
  }

  async onApplicationBootstrap() {
    // Initialize system admin
    const systemAdmin = await this.repository.findOne({
      where: { email: configs.SYS_ADMIN_EMAIL },
    });

    if (systemAdmin) return;

    await this.create({
      name: 'System Admin',
      email: configs.SYS_ADMIN_EMAIL,
      plainPassword: configs.SYS_ADMIN_PASSWORD,
    });

    logger.info(`System Admin created`, {
      fields: { email: configs.SYS_ADMIN_EMAIL },
    });
  }
}
