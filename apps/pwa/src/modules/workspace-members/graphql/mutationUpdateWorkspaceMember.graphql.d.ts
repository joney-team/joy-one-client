import type * as Types from '../../../graphql/types.graphql.d';

export type UpdateWorkspaceMemberMutationVariables = Types.Exact<{
  input: Types.UpdateWorkspaceMemberInput;
  memberId: Types.Scalars['String']['input'];
}>;


export type UpdateWorkspaceMemberMutation = { __typename: 'Mutation', updateWorkspaceMember: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, email: string, phone: string | null, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, permissions: Array<string>, workingTimeType: Types.WorkspaceMemberWorkingTimeType | null, memberDisplayName: string | null, joinedAt: number | null, workspace: { __typename: 'Workspace', _id: string, code: string, type: Types.WorkspaceType, inviteCode: string | null, name: string, logo: string | null, hotline: string | null, phone: string | null, locale: Types.AppLocale | null, appIcon: string | null, appColor: string | null, appName: string | null, appDomain: string | null, appColorShape: number | null, branches: number, isArchived: boolean | null, location: { __typename: 'Location', address: string | null } | null }, workspaceBranches: Array<{ __typename: 'WorkspaceMemberWorkspaceBranchInfo', _id: string, name: string, hotline: string | null }>, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const UpdateWorkspaceMemberDocument = (import("graphql").DocumentNode) as TypedDocumentNode<UpdateWorkspaceMemberMutation, UpdateWorkspaceMemberMutationVariables>;
export default UpdateWorkspaceMemberDocument 