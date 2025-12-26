import type * as Types from '../../../graphql/types.graphql.d';

export type RemoveReactionMutationVariables = Types.Exact<{
  entity: Types.Scalars['String']['input'];
  entityId: Types.Scalars['String']['input'];
  type: Types.ReactionType;
}>;


export type RemoveReactionMutation = { __typename: 'Mutation', removeReaction: boolean };

declare const Document: import("graphql").DocumentNode; export default Document;