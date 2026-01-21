import type * as Types from '../../../graphql/types.graphql.d';

export type AddReactionMutationVariables = Types.Exact<{
  type: Types.ReactionType;
  entity: Types.Scalars['String']['input'];
  entityId: Types.Scalars['String']['input'];
}>;


export type AddReactionMutation = { __typename: 'Mutation', addReaction: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const AddReactionDocument = (import("graphql").DocumentNode) as TypedDocumentNode<AddReactionMutation, AddReactionMutationVariables>;
export default AddReactionDocument 