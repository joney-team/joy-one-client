import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceMembersQueryVariables = Types.Exact<{
  ignoreSelf?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  ids?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  userId?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type WorkspaceMembersQuery = { __typename: 'Query', list: { __typename: 'WorkspaceMembersPaginated', total: number, results: Array<{ __typename: 'WorkspaceMember', _id: string, userId: string, name: string, email: string, phone: string | null, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, permissions: Array<string>, workingTimeType: Types.WorkspaceMemberWorkingTimeType | null, memberDisplayName: string | null, joinedAt: number | null, workspace: { __typename: 'Workspace', _id: string, code: string, type: Types.WorkspaceType, inviteCode: string | null, name: string, logo: string | null, hotline: string | null, phone: string | null, locale: Types.AppLocale | null, appIcon: string | null, appColor: string | null, appName: string | null, appDomain: string | null, appColorShape: number | null, branches: number, isArchived: boolean | null, location: { __typename: 'LocationEntity', address: string | null } | null }, workspaceBranches: Array<{ __typename: 'WorkspaceMemberWorkspaceBranchInfo', _id: string, name: string }>, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceMembersDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceMembersQuery, WorkspaceMembersQueryVariables>;
export default WorkspaceMembersDocument 