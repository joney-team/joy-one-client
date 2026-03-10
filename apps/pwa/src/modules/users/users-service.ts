import { AppLocale } from "@/graphql/types.graphql";
import { apiClient } from "../apis";
import { UpdateUserPasswordDto, UserPublicInformation } from "./users-types";

export async function signOut() {
  return apiClient.post(`/auth/sign-out`);
}

export async function updatePassword(dto: UpdateUserPasswordDto) {
  return apiClient.put(`/users/password`, dto);
}

export async function setUserLocale(locale?: AppLocale | null) {
  return apiClient.put(`/users/locale`, { locale });
}

export async function getUserPublicInformation(userId: string) {
  return apiClient.get<UserPublicInformation>(`/workspace-members/public-users/${userId}`);
}
