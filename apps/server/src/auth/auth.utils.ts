import { UserEntity } from '../users/entities/user.entity';
import { UserRole } from '../users/users.types';
import { AuthUser } from './auth.types';

export function normalizeAuthUser(user: UserEntity): AuthUser {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role ?? UserRole.MEMBER,
    locale: user.locale,
    settings: user.settings,
    birthday: user.birthday,
    isPasswordProvided: !!user.password,
    isEmailVerified: user.isEmailVerified,
  };
}
