import type * as Types from '../../../graphql/types.graphql.d';

export type RemoveTagMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type RemoveTagMutation = { __typename: 'Mutation', removeTag: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const RemoveTagDocument = (import("graphql").DocumentNode) as TypedDocumentNode<RemoveTagMutation, RemoveTagMutationVariables>;
export default RemoveTagDocument 