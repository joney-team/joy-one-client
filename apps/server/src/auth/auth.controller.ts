import { Body, Controller, Get, Post } from '@nestjs/common';
import { Auth, Device, RequireDevice, User } from '../app.decorators';
import { DeviceEntity } from '../devices/devices.entity';
import { DevicesService } from '../devices/devices.service';
import { QueueProducersService } from '../queue-producers/queue-producers.service';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
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
import { AuthService } from './auth.service';
import { AuthUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly devices: DevicesService,
    private readonly users: UsersService,
    private readonly queueProducers: QueueProducersService,
  ) {}

  @Get()
  @Auth()
  async me(@User() user: UserEntity, @Device() device: DeviceEntity) {
    const result: AuthUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      locale: user.locale,
      settings: user.settings,
      birthday: user.birthday,
      isPasswordProvided: !!user.password,
      isEmailVerified: user.isEmailVerified,
    };

    await Promise.all([
      this.users.updateLastSignIn(user),
      this.devices.setUserId({
        deviceId: device._id.toString(),
        userId: user._id.toString(),
      }),
    ]);

    return result;
  }

  @Post('sign-up/email-password')
  async signUpWithEmailPassword(
    @Body() input: AuthSignUpWithEmailPasswordInput,
  ) {
    return this.service.signUpWithEmailPassword(input);
  }

  @Post('sign-in/email-password')
  async signInWithEmailPassword(
    @Body() input: AuthSignInWithEmailPasswordInput,
  ) {
    return this.service.signInWithEmailPassword(input);
  }

  @Post('sign-in/firebase')
  async signInWithFirebase(@Body() Input: AuthSignInWithFirebaseInput) {
    return this.service.signInWithFirebase(Input);
  }

  @Post('sign-in/facebook')
  async signInWithFacebook(@Body() input: AuthSignInWithFacebookInput) {
    return this.service.signInWithFacebook(input);
  }

  @Post('refresh-token')
  async refreshToken(@Body() input: AuthRefreshTokenInput) {
    return this.service.refreshToken(input);
  }

  @Post('sign-out')
  @Auth()
  @RequireDevice()
  async signOut(@User() user: UserEntity, @Device() device: DeviceEntity) {
    return this.service.signOut(user, device);
  }

  @Post('sign-out/other-devices')
  @Auth()
  @RequireDevice()
  async signOutOtherDevices(
    @User() user: UserEntity,
    @Device() device: DeviceEntity,
  ) {
    return this.service.signOutOtherDevices(user, device);
  }

  @Post('renew-password/request')
  async requestRenewPassword(@Body() input: AuthRequestRenewUserPasswordInput) {
    return this.service.requestRenewPassword(input);
  }

  @Post('renew-password/verify')
  async verifyRenewPasswordCode(
    @Body() input: AuthVerifyRenewPasswordCodeInput,
  ) {
    return this.service.verifyRenewPasswordCode(input);
  }

  @Post('renew-password')
  async renewPassword(@Body() input: AuthRenewPasswordByCodeInput) {
    return this.service.renewPassword(input);
  }
}
