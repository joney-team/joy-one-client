import type * as Types from '../../../graphql/types.graphql.d';

export type DuplicateTaskMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  overwrite?: Types.InputMaybe<Types.CreateTaskInput>;
}>;


export type DuplicateTaskMutation = { __typename: 'Mutation', duplicateTask: { __typename: 'Task', _id: string } };

declare const Document: import("graphql").DocumentNode; export default Document;