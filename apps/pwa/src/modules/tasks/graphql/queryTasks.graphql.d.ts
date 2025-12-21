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
  isProgressOnly?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  isClosedOnly?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  fromTrackingTime?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  toTrackingTime?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type TasksQuery = { __typename: 'Query', tasks: { __typename: 'TasksPaginated', count: number, data: Array<{ __typename: 'Task', _id: string, code: string, name: string, description: string | null, status: string, order: number, childCount: number, startDate: number | null, dueDate: number | null, estimatedTime: number | null, childEstimatedTime: number | null, priority: Types.TaskPriority | null, progress: number, childProgress: number, parentId: string | null, folderId: string | null, createdAt: number | null, isArchived: boolean | null, childOrder: { __typename: 'TaskChildOrder', first: number | null, last: number | null }, childTimeline: { __typename: 'TaskChildTimeline', startDate: number | null, dueDate: number | null } | null, partners: Array<{ __typename: 'PartnerEntity', _id: string, name: string, logo: string | null }>, assigneeUsers: Array<{ __typename: 'WorkspaceMember', _id: string, userId: string, name: string, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> }>, customer: { __typename: 'Customer', _id: string, code: string, name: string, avatar: string | null, phone: string | null } | null, parent: { __typename: 'Task', _id: string, name: string, code: string, order: number, folderId: string | null, folder: { __typename: 'Tag', _id: string, color: string | null, name: string, slug: string } | null } | null, tags: Array<{ __typename: 'Tag', _id: string, color: string | null, name: string }>, folder: { __typename: 'Tag', _id: string, color: string | null, name: string, slug: string } | null, timeTrackings: Array<{ __typename: 'TaskTimeTracking', id: string, workspaceId: string, userId: string, note: string | null, startAt: number, endAt: number | null, user: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } | null }> | null, statuses: Array<{ __typename: 'TaskStatus', id: string, name: string | null, color: string | null, order: number, contextId: string | null, contextType: Types.TaskContextType | null }> }> } };

declare const Document: import("graphql").DocumentNode; export default Document;