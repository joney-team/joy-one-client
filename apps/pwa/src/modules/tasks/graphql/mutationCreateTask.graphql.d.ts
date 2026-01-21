import type * as Types from '../../../graphql/types.graphql.d';

export type CreateTaskMutationVariables = Types.Exact<{
  input: Types.CreateTaskInput;
}>;


export type CreateTaskMutation = { __typename: 'Mutation', createTask: { __typename: 'Task', _id: string } };


import { TypedDocumentNode } from '@apollo/client/core';
export const CreateTaskDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CreateTaskMutation, CreateTaskMutationVariables>;
export default CreateTaskDocument 