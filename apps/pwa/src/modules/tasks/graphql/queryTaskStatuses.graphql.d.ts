import type * as Types from '../../../graphql/types.graphql.d';

export type TaskStatusesQueryVariables = Types.Exact<{
  contextType?: Types.InputMaybe<Types.TaskStatusesContextType>;
  contextId?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type TaskStatusesQuery = { __typename: 'Query', taskStatuses: { __typename: 'ConfigTaskStatuses', isCustomized: boolean, statuses: Array<{ __typename: 'TaskStatus', id: string, name: string | null, color: string | null, order: number | null, contextId: string | null, contextType: Types.TaskStatusesContextType | null }> } };

declare const Document: import("graphql").DocumentNode; export default Document;