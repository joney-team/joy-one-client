import { getDeviceId } from "../devices/devices-service";
import { Locale } from "../lang/lang-types";
import { MainRequest } from "../requests/main.request";
import { SignOutDto, UpdateUserPasswordDto, UserPublicInformation } from "./users-types";

export async function signOut() {
  return MainRequest.post(`/auth/sign-out`)
}

export async function signOutOtherDevices() {
  const dto: SignOutDto = { deviceId: getDeviceId()! };
  return MainRequest.post(`/auth/sign-out/other-devices`, dto)
}

export async function updatePassword(dto: UpdateUserPasswordDto) {
  return MainRequest.put(`/users/password`, dto)
}

export async function setUserLocale(locale?: Locale | null) {
  return MainRequest.put(`/users/locale`, { locale })
}

export async function getUserPublicInformation(userId: string) {
  return MainRequest.get<UserPublicInformation>(`/workspace-members/public-users/${userId}`)
}