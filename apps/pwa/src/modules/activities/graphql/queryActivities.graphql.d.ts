import type * as Types from '../../../graphql/types.graphql.d';

export type ActivitiesQueryVariables = Types.Exact<{
  contextType: Types.Scalars['String']['input'];
  contextId: Types.Scalars['String']['input'];
  type?: Types.InputMaybe<Types.ActivityType>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  ids?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  sortCreatedAt?: Types.InputMaybe<Types.SortDirection>;
  parentId?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ActivitiesQuery = { __typename: 'Query', activities: { __typename: 'ActivitiesPaginated', count: number, data: Array<{ __typename: 'Activity', _id: string, contextType: string, contextId: string, type: Types.ActivityType, content: string | null, contentLastModifiedAt: number | null, data: any | null, parentId: string | null, childCount: number | null, isPinned: boolean | null, createdAt: number | null, updatedAt: number | null, reactionsCount: { __typename: 'ReactionsCount', reactions: Array<{ __typename: 'ReactionCount', userIds: Array<string>, type: Types.ReactionType, count: number }> }, createdByUser: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, email: string, phone: string | null, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, permissions: Array<string>, workingTimeType: Types.WorkspaceMemberWorkingTimeType | null, memberDisplayName: string | null, workspace: { __typename: 'Workspace', _id: string, code: string, type: Types.WorkspaceType, inviteCode: string | null, name: string, logo: string | null, hotline: string | null, phone: string | null, locale: Types.AppLocale | null, appIcon: string | null, appColor: string | null, appName: string | null, appDomain: string | null, appColorShape: number | null, branches: number, isArchived: boolean | null, location: { __typename: 'LocationEntity', address: string | null } | null }, workspaceBranches: Array<{ __typename: 'WorkspaceMemberWorkspaceBranchInfo', _id: string, name: string }>, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const ActivitiesDocument = (import("graphql").DocumentNode) as TypedDocumentNode<ActivitiesQuery, ActivitiesQueryVariables>;
export default ActivitiesDocument 