import type * as Types from '../../../graphql/types.graphql.d';

export type TaskStatusesQueryVariables = Types.Exact<{
  contextType?: Types.InputMaybe<Types.TaskStatusesContextType>;
  contextId?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type TaskStatusesQuery = { __typename: 'Query', taskStatuses: Array<{ __typename: 'TaskStatus', id: string, name: string | null, color: string | null, icon: string | null, order: number | null }> };

declare const Document: import("graphql").DocumentNode; export default Document;