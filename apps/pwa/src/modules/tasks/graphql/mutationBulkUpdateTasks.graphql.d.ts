import type * as Types from '../../../graphql/types.graphql.d';

export type BulkUpdateTasksMutationVariables = Types.Exact<{
  items: Array<Types.UpdateTaskInput>;
}>;


export type BulkUpdateTasksMutation = { __typename: 'Mutation', bulkUpdateTasks: Array<{ __typename: 'Task', _id: string }> };


import { TypedDocumentNode } from '@apollo/client/core';
export const BulkUpdateTasksDocument = (import("graphql").DocumentNode) as TypedDocumentNode<BulkUpdateTasksMutation, BulkUpdateTasksMutationVariables>;
export default BulkUpdateTasksDocument 