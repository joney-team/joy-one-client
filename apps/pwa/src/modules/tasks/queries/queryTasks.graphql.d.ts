import type * as Types from '../../../graphql/types.graphql.d';

export type TasksQueryVariables = Types.Exact<{
  folderId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  parentId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  status?: Types.InputMaybe<Types.Scalars['String']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  ids?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  assigneeUserIds?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  partnerIds?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  tagIds?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  priority?: Types.InputMaybe<Types.TaskPriority>;
  all?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;


export type TasksQuery = { __typename: 'Query', tasks: { __typename: 'TasksPaginated', count: number, data: Array<{ __typename: 'Task', _id: string, code: string, name: string, description: string | null, status: string, order: number, childCount: number, startDate: number | null, dueDate: number | null, estimatedTime: number | null, priority: Types.TaskPriority | null, progress: number, childProgress: number, parentId: string | null, folderId: string | null, createdAt: number | null, isArchived: boolean | null, childOrder: { __typename: 'TaskChildOrder', first: number | null, last: number | null }, childTimeline: { __typename: 'TaskChildTimeline', startDate: number | null, dueDate: number | null } | null, partners: Array<{ __typename: 'PartnerEntity', _id: string, name: string, logo: string | null }>, assigneeUsers: Array<{ __typename: 'WorkspaceMemberInfo', _id: string, userId: string, name: string, color: string | null, avatar: string | null, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> }>, customer: { __typename: 'CustomerEntity', _id: string, name: string, avatar: string | null, phone: string | null } | null, parent: { __typename: 'Task', _id: string, name: string, code: string, order: number, folderId: string | null, folder: { __typename: 'TagEntity', _id: string, color: string | null, name: string, slug: string } | null } | null, tags: Array<{ __typename: 'TagEntity', _id: string, color: string | null, name: string }>, folder: { __typename: 'TagEntity', _id: string, color: string | null, name: string, slug: string } | null, timeTrackings: Array<{ __typename: 'TaskTimeTracking', id: string, workspaceId: string, userId: string, billable: boolean | null, note: string | null, startAt: number, endAt: number | null, user: { __typename: 'WorkspaceMemberInfo', _id: string, name: string, color: string | null, avatar: string | null } | null }> | null }> } };

declare const Document: import("graphql").DocumentNode; export default Document;