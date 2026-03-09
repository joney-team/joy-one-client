import { AppLocale } from "@/graphql/types.graphql";
import { api } from "../apis";
import { UpdateUserPasswordDto, UserPublicInformation } from "./users-types";

export async function signOut() {
  return api.post(`/auth/sign-out`);
}

export async function updatePassword(dto: UpdateUserPasswordDto) {
  return api.put(`/users/password`, dto);
}

export async function setUserLocale(locale?: AppLocale | null) {
  return api.put(`/users/locale`, { locale });
}

export async function getUserPublicInformation(userId: string) {
  return api.get<UserPublicInformation>(`/workspace-members/public-users/${userId}`);
}
