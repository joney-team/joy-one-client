import type * as Types from '../../../graphql/types.graphql.d';

export type RemoveReactionMutationVariables = Types.Exact<{
  entity: Types.Scalars['String']['input'];
  entityId: Types.Scalars['String']['input'];
  type: Types.ReactionType;
}>;


export type RemoveReactionMutation = { __typename: 'Mutation', removeReaction: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const RemoveReactionDocument = (import("graphql").DocumentNode) as TypedDocumentNode<RemoveReactionMutation, RemoveReactionMutationVariables>;
export default RemoveReactionDocument 