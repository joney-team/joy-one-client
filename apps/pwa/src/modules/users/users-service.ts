import { api } from "../apis";
import { getDeviceId } from "../devices/devices-service";
import { Locale } from "../lang/lang-types";
import { SignOutDto, UpdateUserPasswordDto, UserPublicInformation } from "./users-types";

export async function signOut() {
  return api.post(`/auth/sign-out`)
}

export async function signOutOtherDevices() {
  const dto: SignOutDto = { deviceId: getDeviceId()! };
  return api.post(`/auth/sign-out/other-devices`, dto)
}

export async function updatePassword(dto: UpdateUserPasswordDto) {
  return api.put(`/users/password`, dto)
}

export async function setUserLocale(locale?: Locale | null) {
  return api.put(`/users/locale`, { locale })
}

export async function getUserPublicInformation(userId: string) {
  return api.get<UserPublicInformation>(`/workspace-members/public-users/${userId}`)
}