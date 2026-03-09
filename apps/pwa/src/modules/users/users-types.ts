import { WorkspaceType } from "@/graphql/types.graphql";

export interface UserAuthProvider {
  providerId: string;
  uid: string;
  username?: string;
}

export interface SignOutDto {
  deviceId: string;
}

export interface UpdateUserPasswordDto {
  password: string;
  plainPassword: string;
}

export interface UserMutualWorkspace {
  _id: string;
  name: string;
  type: WorkspaceType;
  logo?: string;
  color?: string;
  displayName?: string;
  memberId: string;
  memberColor?: string;
  roles: { __typename: "WorkspaceMemberRole"; _id: string; name: string; color: string }[];
}

export interface UserPublicInformation {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  birthday?: number;
  phone?: string;
  color?: string;
  lastSignInAt?: number;
  providers: UserAuthProvider[];
  mutualWorkspaces: UserMutualWorkspace[];
}
