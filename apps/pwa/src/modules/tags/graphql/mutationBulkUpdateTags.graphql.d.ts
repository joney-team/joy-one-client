import type * as Types from '../../../graphql/types.graphql.d';

export type BulkUpdateTagsMutationVariables = Types.Exact<{
  items: Array<Types.UpdateTagInput>;
}>;


export type BulkUpdateTagsMutation = { __typename: 'Mutation', bulkUpdateTags: Array<{ __typename: 'Tag', _id: string }> };


import { TypedDocumentNode } from '@apollo/client/core';
export const BulkUpdateTagsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<BulkUpdateTagsMutation, BulkUpdateTagsMutationVariables>;
export default BulkUpdateTagsDocument 