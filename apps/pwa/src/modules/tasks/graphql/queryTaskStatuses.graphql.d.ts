import type * as Types from '../../../graphql/types.graphql.d';

export type TaskStatusesQueryVariables = Types.Exact<{
  contextType?: Types.InputMaybe<Types.TaskStatusesContextType>;
  contextId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  mode?: Types.InputMaybe<Types.GetTaskStatusesMode>;
}>;


export type TaskStatusesQuery = { __typename: 'Query', taskStatuses: { __typename: 'ConfigTaskStatuses', isInherited: boolean, statuses: Array<{ __typename: 'TaskStatus', id: string, name: string | null, color: string | null, order: number, contextId: string | null, contextType: Types.TaskStatusesContextType | null }>, workspaceStatuses: Array<{ __typename: 'TaskStatus', id: string, name: string | null, color: string | null, order: number, contextId: string | null, contextType: Types.TaskStatusesContextType | null }> } };

declare const Document: import("graphql").DocumentNode; export default Document;