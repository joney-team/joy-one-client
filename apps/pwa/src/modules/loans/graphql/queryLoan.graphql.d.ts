import type * as Types from '../../../graphql/types.graphql.d';

export type LoanQueryVariables = Types.Exact<{
  loanId: Types.Scalars['String']['input'];
}>;


export type LoanQuery = { __typename: 'Query', loan: { __typename: 'Loan', id: string, code: string, status: Types.LoanStatus, assetType: Types.LoanAssetType, amount: number, customer: { __typename: 'Customer', name: string } } };


import { TypedDocumentNode } from '@apollo/client/core';
export const LoanDocument = (import("graphql").DocumentNode) as TypedDocumentNode<LoanQuery, LoanQueryVariables>;
export default LoanDocument 