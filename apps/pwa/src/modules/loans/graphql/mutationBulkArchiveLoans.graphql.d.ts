import type * as Types from '../../../graphql/types.graphql.d';

export type BulkArchiveLoansMutationVariables = Types.Exact<{
  input: Types.BulkArchiveLoansInput;
}>;


export type BulkArchiveLoansMutation = { __typename: 'Mutation', bulkArchiveLoans: Array<string> };


import { TypedDocumentNode } from '@apollo/client/core';
export const BulkArchiveLoansDocument = (import("graphql").DocumentNode) as TypedDocumentNode<BulkArchiveLoansMutation, BulkArchiveLoansMutationVariables>;
export default BulkArchiveLoansDocument 