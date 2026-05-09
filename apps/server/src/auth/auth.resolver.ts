import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, Device, RequireDevice, User } from '../app.decorators';
import { DeviceEntity } from '../devices/devices.entity';
import { DevicesService } from '../devices/devices.service';
import { VerifyRenewPasswordResult } from '../user-auth-sessions/user-auth-sessions.types';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  UpdateUserPasswordInput,
  UpdateUserProfileInput,
} from '../users/users.types';
import {
  AuthRefreshTokenInput,
  AuthRenewPasswordByCodeInput,
  AuthRequestRenewUserPasswordInput,
  AuthSignInWithEmailPasswordInput,
  AuthSignInWithFirebaseInput,
  AuthSignUpWithEmailPasswordInput,
  AuthVerifyRenewPasswordCodeInput,
} from './auth.dtos';
import { AuthService } from './auth.service';
import { AuthTokenResult, AuthUser } from './auth.types';
import { normalizeAuthUser } from './auth.utils';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly service: AuthService,
    private readonly users: UsersService,
    private readonly devices: DevicesService,
  ) {}

  @Query(() => AuthUser)
  @Auth()
  @RequireDevice()
  async authUser(
    @User() user: UserEntity,
    @Device() device: DeviceEntity,
  ): Promise<AuthUser> {
    await Promise.all([
      this.users.updateLastSignIn(user),
      this.devices.setUserId({
        deviceId: device._id.toString(),
        userId: user._id.toString(),
      }),
    ]);

    return normalizeAuthUser(user);
  }

  @Mutation(() => AuthTokenResult)
  async signUpWithEmailPassword(
    @Args('input') input: AuthSignUpWithEmailPasswordInput,
  ): Promise<AuthTokenResult> {
    return this.service.signUpWithEmailPassword(input);
  }

  @Mutation(() => AuthTokenResult)
  async signInWithEmailPassword(
    @Args('input') input: AuthSignInWithEmailPasswordInput,
  ) {
    return this.service.signInWithEmailPassword(input);
  }

  @Mutation(() => AuthTokenResult)
  async signInWithFirebase(
    @Args('input') input: AuthSignInWithFirebaseInput,
  ): Promise<AuthTokenResult> {
    return this.service.signInWithFirebase(input);
  }

  @Mutation(() => AuthUser)
  @Auth()
  async updateUserProfile(
    @User() user: UserEntity,
    @Args('input') input: UpdateUserProfileInput,
  ) {
    const updatedUser = await this.users.updateProfile(user, input);
    return normalizeAuthUser(updatedUser);
  }

  @Mutation(() => Boolean)
  @Auth()
  async updateUserPassword(
    @User() user: UserEntity,
    @Args('input') input: UpdateUserPasswordInput,
  ) {
    await this.users.updatePassword(user, input);
    return true;
  }

  @Mutation(() => Boolean)
  async renewPassword(@Args('input') input: AuthRenewPasswordByCodeInput) {
    await this.service.renewPassword(input);
    return true;
  }

  @Mutation(() => Boolean)
  async requestRenewPassword(
    @Args('input') input: AuthRequestRenewUserPasswordInput,
  ) {
    await this.service.requestRenewPassword(input);
    return true;
  }

  @Mutation(() => VerifyRenewPasswordResult)
  async verifyRenewPasswordCode(
    @Args('input') input: AuthVerifyRenewPasswordCodeInput,
  ) {
    return this.service.verifyRenewPasswordCode(input);
  }

  @Mutation(() => Boolean)
  async signOut(@User() user: UserEntity, @Device() device: DeviceEntity) {
    const result = await this.service.signOut(user, device);
    return result.signout;
  }

  @Mutation(() => AuthTokenResult)
  async signOutOtherDevices(
    @User() user: UserEntity,
    @Device() device: DeviceEntity,
  ) {
    return this.service.signOutOtherDevices(user, device);
  }

  @Mutation(() => AuthTokenResult)
  async refreshToken(@Args('input') input: AuthRefreshTokenInput) {
    return this.service.refreshToken(input);
  }
}
