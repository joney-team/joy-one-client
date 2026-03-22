import { AppLocale } from "@/graphql/types.graphql";
import { restClient } from "../apis/rest-client";
import { UpdateUserPasswordDto, UserPublicInformation } from "./users-types";

export async function signOut() {
  return restClient.post(`/auth/sign-out`);
}

export async function updatePassword(dto: UpdateUserPasswordDto) {
  return restClient.put(`/users/password`, dto);
}

export async function setUserLocale(locale?: AppLocale | null) {
  return restClient.put(`/users/locale`, { locale });
}

export async function getUserPublicInformation(userId: string) {
  return restClient.get<UserPublicInformation>(`/workspace-members/public-users/${userId}`);
}
