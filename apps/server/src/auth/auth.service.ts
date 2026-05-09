import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { firebaseApp } from '../app.firebase';
import { AppMessage } from '../app.message';
import { configs } from '../config/config';
import { DeviceEntity } from '../devices/devices.entity';
import { DevicesService } from '../devices/devices.service';
import { MetaService } from '../meta/meta.service';
import { UserAuthSessionsService } from '../user-auth-sessions/user-auth-sessions.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UserTokens } from '../users/users.tokens';
import {
  AuthRefreshTokenInput,
  AuthRenewPasswordByCodeInput,
  AuthRequestRenewUserPasswordInput,
  AuthSignInWithEmailPasswordInput,
  AuthSignInWithFacebookInput,
  AuthSignInWithFirebaseInput,
  AuthSignUpWithEmailPasswordInput,
  AuthVerifyRenewPasswordCodeInput,
} from './auth.dtos';
import { AuthTokenResult } from './auth.types';
import { QueueProducersService } from 'src/queue-producers/queue-producers.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly userAuthSessions: UserAuthSessionsService,
    private readonly meta: MetaService,
    private readonly devices: DevicesService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  async authResponse(user: UserEntity): Promise<AuthTokenResult> {
    return UserTokens.create(user);
  }

  async signInWithFirebase(input: AuthSignInWithFirebaseInput) {
    const firebaseUserToken = await firebaseApp
      .auth()
      .verifyIdToken(input.idToken);
    const firebaseUser = await firebaseApp
      .auth()
      .getUser(firebaseUserToken.uid);

    const user = await this.users.syncWithAuthProvider({
      email:
        firebaseUser.email ||
        firebaseUser.providerData.find((v) => v.email)?.email,
      uid: firebaseUser.uid,
      name:
        firebaseUser.displayName ||
        firebaseUser.providerData.find((v) => v.displayName)?.displayName,
      avatar:
        firebaseUser.photoURL ||
        firebaseUser.providerData.find((v) => v.photoURL)?.photoURL,
      phone:
        firebaseUser.phoneNumber ||
        firebaseUser.providerData.find((v) => v.phoneNumber)?.phoneNumber,
    });

    return this.authResponse(user);
  }

  async signInWithEmailPassword(input: AuthSignInWithEmailPasswordInput) {
    const user = await this.users.getByEmail(input.email).catch(() => {
      throw new ForbiddenException(AppMessage.EMAIL_OR_PASSWORD_INCORRECT);
    });

    if (!user.password) {
      throw new ForbiddenException(AppMessage.PASSWORD_DOES_NOT_PROVIDED);
    }

    const isCorrectPassword = await this.users.comparePassword(
      input.password,
      user.password,
    );

    if (!isCorrectPassword) {
      throw new ForbiddenException(AppMessage.EMAIL_OR_PASSWORD_INCORRECT);
    }

    return this.authResponse(user);
  }

  async signInWithFacebook(input: AuthSignInWithFacebookInput) {
    const fbAccount = await this.meta.get(`/me`, {
      params: {
        fields: 'name,email,picture',
        access_token: input.accessToken,
      },
    });

    const user = await this.users.syncWithAuthProvider({
      email: fbAccount.email,
      uid: fbAccount.id,
      name: fbAccount.name,
      avatar: fbAccount.picture.data.url,
      emailVerified: fbAccount.email_verified,
      provider: 'facebook.com',
    });

    return this.authResponse(user);
  }

  async increaseAuthVersion(user: UserEntity) {
    await this.users.increaseAuthVersion(user);
  }

  async refreshToken(input: AuthRefreshTokenInput): Promise<AuthTokenResult> {
    const data = await UserTokens.verifyRefreshToken(input.refreshToken);
    const user = await this.users.get(data._id);

    if (user.authVersion !== data.authVersion) {
      throw new UnauthorizedException(AppMessage.INVALID_SESSION);
    }

    return UserTokens.create(user);
  }

  async signOut(_: UserEntity, device: DeviceEntity) {
    await this.devices.setUserId({ deviceId: device._id, userId: null });

    return {
      signout: true,
    };
  }

  async signUpWithEmailPassword(input: AuthSignUpWithEmailPasswordInput) {
    const user = await this.users.create(input);
    return this.authResponse(user);
  }

  async signOutOtherDevices(user: UserEntity, device: DeviceEntity) {
    await this.users.increaseAuthVersion(user);

    // Revoke other devices
    const revokeDevices = await this.devices
      .getByUserId(user._id.toString())
      .then((val) =>
        val.filter(
          (revokeDevice) =>
            revokeDevice._id.toString() !== device._id.toString(),
        ),
      );

    await Promise.all(
      revokeDevices.map((revokeDevice) => {
        return this.devices.setUserId({
          deviceId: revokeDevice._id.toString(),
          userId: null,
        });
      }),
    );

    this.queueProducers.sendUserEvent({
      eventName: 'SIGN_OUT_DEVICES',
      userId: user._id.toString(),
      data: {
        deviceIds: revokeDevices.map((v) => v._id.toString()),
      },
    });

    return this.authResponse(user);
  }

  async requestRenewPassword(input: AuthRequestRenewUserPasswordInput) {
    return this.userAuthSessions.requestRenewPassword(input);
  }

  async verifyRenewPasswordCode(input: AuthVerifyRenewPasswordCodeInput) {
    return this.userAuthSessions.verifyRenewPasswordCode(input);
  }

  async renewPassword(input: AuthRenewPasswordByCodeInput) {
    return this.userAuthSessions.renewPassword(input);
  }

  async verifyAccessToken(accessToken: string) {
    const data = await UserTokens.verifyAccessToken(accessToken);

    const user = await this.users.get(data._id).catch(() => null);

    // Validate auth version
    if (!user || +user.authVersion !== +data.authVersion) {
      throw new UnauthorizedException();
    }

    return this.users.bindRoles(user);
  }
}
