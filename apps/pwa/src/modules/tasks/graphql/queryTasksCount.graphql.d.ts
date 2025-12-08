import type * as Types from '../../../graphql/types.graphql.d';

export type TasksCountQueryVariables = Types.Exact<{
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


export type TasksCountQuery = { __typename: 'Query', tasksCount: number };

declare const Document: import("graphql").DocumentNode; export default Document;