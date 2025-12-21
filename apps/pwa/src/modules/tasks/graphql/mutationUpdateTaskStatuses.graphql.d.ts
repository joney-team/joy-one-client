import type * as Types from '../../../graphql/types.graphql.d';

export type UpdateTaskStatusesMutationVariables = Types.Exact<{
  statuses: Array<Types.TaskStatusInput>;
  contextType?: Types.InputMaybe<Types.TaskContextType>;
  contextId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  isInherited?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;


export type UpdateTaskStatusesMutation = { __typename: 'Mutation', updateTaskStatuses: Array<{ __typename: 'TaskStatus', id: string, name: string | null, color: string | null, order: number, contextId: string | null, contextType: Types.TaskContextType | null }> };

declare const Document: import("graphql").DocumentNode; export default Document;