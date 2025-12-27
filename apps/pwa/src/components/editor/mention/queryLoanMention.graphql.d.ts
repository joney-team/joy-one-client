import type * as Types from '../../../graphql/types.graphql.d';

export type LoanMentionQueryVariables = Types.Exact<{
  loanId: Types.Scalars['String']['input'];
}>;


export type LoanMentionQuery = { __typename: 'Query', loan: { __typename: 'Loan', id: string, code: string, status: Types.LoanStatus, assetType: Types.LoanAssetType, amount: number, customer: { __typename: 'Customer', name: string } } };

declare const Document: import("graphql").DocumentNode; export default Document;