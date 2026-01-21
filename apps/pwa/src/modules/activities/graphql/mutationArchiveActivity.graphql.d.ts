import type * as Types from '../../../graphql/types.graphql.d';

export type ArchiveActivityMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type ArchiveActivityMutation = { __typename: 'Mutation', archiveActivity: { __typename: 'Activity', _id: string } };


import { TypedDocumentNode } from '@apollo/client/core';
export const ArchiveActivityDocument = (import("graphql").DocumentNode) as TypedDocumentNode<ArchiveActivityMutation, ArchiveActivityMutationVariables>;
export default ArchiveActivityDocument 