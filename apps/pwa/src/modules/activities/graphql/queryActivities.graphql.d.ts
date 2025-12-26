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


export type ActivitiesQuery = { __typename: 'Query', activities: { __typename: 'ActivitiesPaginated', count: number, data: Array<{ __typename: 'Activity', _id: string, contextType: string, contextId: string, type: Types.ActivityType, content: string | null, data: any | null, parentId: string | null, childCount: number | null, isPinned: boolean | null, createdAt: number | null, reactionsCount: { __typename: 'ReactionsCount', reactions: Array<{ __typename: 'ReactionCount', userIds: Array<string>, type: Types.ReactionType, count: number }> }, createdByUser: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } }> } };

declare const Document: import("graphql").DocumentNode; export default Document;