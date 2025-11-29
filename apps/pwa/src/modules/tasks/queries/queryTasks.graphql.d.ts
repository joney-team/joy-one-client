import type * as Types from '../../../graphql/types.graphql.d';

export type TasksQueryVariables = Types.Exact<{
  folderId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  parentId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  status?: Types.InputMaybe<Types.Scalars['String']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  ids?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  assigneeUserIds?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  partnerIds?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
  tagIds?: Types.InputMaybe<Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input']>;
}>;


export type TasksQuery = { __typename: 'Query', tasks: { __typename: 'TasksPaginated', count: number, data: Array<{ __typename: 'Task', _id: string, code: string, name: string, status: string, order: number, folderId: string | null, parentId: string | null, childCount: number, startDate: number | null, dueDate: number | null, estimatedTime: number | null, priority: Types.TaskPriority | null, progress: number | null, partners: Array<{ __typename: 'PartnerEntity', _id: string, name: string, logo: string | null }>, assigneeUsers: Array<{ __typename: 'WorkspaceMemberInfo', _id: string, userId: string, name: string, color: string | null, avatar: string | null, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> }>, customer: { __typename: 'CustomerEntity', _id: string, name: string, avatar: string | null, phone: string | null } | null, parent: { __typename: 'Task', _id: string, name: string, code: string } | null, tags: Array<{ __typename: 'TagEntity', _id: string, color: string | null, name: string }>, folder: { __typename: 'TagEntity', _id: string, color: string | null, name: string } | null }> } };

declare const Document: import("graphql").DocumentNode; export default Document;