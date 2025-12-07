import type * as Types from '../../../graphql/types.graphql.d';

export type RemoveTagMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type RemoveTagMutation = { __typename: 'Mutation', removeTag: boolean };

declare const Document: import("graphql").DocumentNode; export default Document;