import type * as Types from '../../../graphql/types.graphql.d';

export type RandomWorkspaceCodeQueryVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
}>;


export type RandomWorkspaceCodeQuery = { __typename: 'Query', randomWorkspaceCode: string };


import { TypedDocumentNode } from '@apollo/client/core';
export const RandomWorkspaceCodeDocument = (import("graphql").DocumentNode) as TypedDocumentNode<RandomWorkspaceCodeQuery, RandomWorkspaceCodeQueryVariables>;
export default RandomWorkspaceCodeDocument 