import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { AppMessage } from '../app.message';
import { configs } from '../config/config';
import { DatabaseName } from '../database/database.types';
import { PluginMailerService } from '../plugin-mailer/plugin-mailer.service';
import { UsersService } from '../users/users.service';
import { DateTime } from '../utils/date-time';
import { UserAuthSessionEntity } from './entities/user-auth-session.entity';
import {
  RenewUserPasswordInput,
  RequestRenewUserPasswordInput,
  UserAuthSessionType,
  VerifyRenewPasswordInput,
  VerifyRenewPasswordResult,
} from './user-auth-sessions.types';

@Injectable()
export class UserAuthSessionsService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly users: UsersService,
    @InjectRepository(UserAuthSessionEntity, DatabaseName.MONGO)
    private readonly repository: MongoRepository<UserAuthSessionEntity>,
    private readonly mailer: PluginMailerService,
  ) {}

  async cleanExpiredSessions() {
    const now = DateTime.getNowInSeconds();
    const expiredSessions = await this.repository.find({
      where: { expireAt: { $lte: now } },
    });

    await Promise.all(
      expiredSessions.map((v) => this.repository.delete(v._id)),
    );
  }

  async randomCode() {
    // Random code with 6 digits
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async save(session: UserAuthSessionEntity) {
    let retryTime = 0;
    let code = '';

    const action = async () => {
      try {
        code = await this.randomCode();
        session.code = code;
        const result = await this.repository.save(session);
        return result;
      } catch (error) {
        if (retryTime < 15) {
          retryTime++;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await action();
        } else {
          throw new BadRequestException(`Vui lòng thữ lại sau 1 phút #${code}`);
        }
      }
    };

    return action();
  }

  async requestRenewPassword(dto: RequestRenewUserPasswordInput) {
    await this.cleanExpiredSessions();
    const user = await this.users.getByEmail(dto.email);

    const session = new UserAuthSessionEntity();
    session.userId = user._id.toString();
    session.type = UserAuthSessionType.RENEW_PASSWORD;
    session.expireAt =
      DateTime.getNowInSeconds() + +configs.RENEW_PASSWORD_SESSION_EXPIRE_TIME;

    await this.save(session);

    await this.mailer.sendUserWithTemplate({
      userId: user._id.toString(),
      template: 'renew_password',
      params: {
        code: session.code,
      },
    });

    return {
      email: user.email,
    };
  }

  async verifyRenewPasswordCode(
    input: VerifyRenewPasswordInput,
  ): Promise<VerifyRenewPasswordResult> {
    await this.cleanExpiredSessions();

    const session = await this.repository.findOne({
      where: { code: input.code, type: UserAuthSessionType.RENEW_PASSWORD },
    });

    if (!session) {
      throw new BadRequestException(AppMessage.INVALID_USER_AUTH_SESSION);
    }

    const user = await this.users.get(session.userId);

    return {
      email: user.email,
    };
  }

  async renewPassword(dto: RenewUserPasswordInput) {
    const { plainPassword, code } = dto;
    await this.cleanExpiredSessions();

    const session = await this.repository.findOne({
      where: { code, type: UserAuthSessionType.RENEW_PASSWORD },
    });

    if (!session) {
      throw new BadRequestException(AppMessage.INVALID_USER_AUTH_SESSION);
    }

    const user = await this.users.get(session.userId);
    await this.users.handleUpdatePassword(user, plainPassword);

    await this.repository.delete(session._id);

    return {
      success: true,
    };
  }
}
