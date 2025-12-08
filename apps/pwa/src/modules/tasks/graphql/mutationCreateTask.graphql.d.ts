import type * as Types from '../../../graphql/types.graphql.d';

export type CreateTaskMutationVariables = Types.Exact<{
  input: Types.CreateTaskInput;
}>;


export type CreateTaskMutation = { __typename: 'Mutation', createTask: { __typename: 'Task', _id: string } };

declare const Document: import("graphql").DocumentNode; export default Document;