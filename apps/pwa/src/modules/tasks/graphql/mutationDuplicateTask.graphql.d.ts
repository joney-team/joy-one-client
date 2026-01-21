import type * as Types from '../../../graphql/types.graphql.d';

export type DuplicateTaskMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  overwrite?: Types.InputMaybe<Types.CreateTaskInput>;
}>;


export type DuplicateTaskMutation = { __typename: 'Mutation', duplicateTask: { __typename: 'Task', _id: string } };


import { TypedDocumentNode } from '@apollo/client/core';
export const DuplicateTaskDocument = (import("graphql").DocumentNode) as TypedDocumentNode<DuplicateTaskMutation, DuplicateTaskMutationVariables>;
export default DuplicateTaskDocument 