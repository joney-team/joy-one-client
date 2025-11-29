import type * as Types from '../../../graphql/types.graphql.d';

export type BulkUpdateTasksMutationVariables = Types.Exact<{
  items: Array<Types.TaskInput> | Types.TaskInput;
}>;


export type BulkUpdateTasksMutation = { __typename: 'Mutation', bulkUpdateTasks: Array<{ __typename: 'Task', _id: string }> };

declare const Document: import("graphql").DocumentNode; export default Document;