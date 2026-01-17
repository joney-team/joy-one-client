import type * as Types from '../../../graphql/types.graphql.d';

export type LoansQueryVariables = Types.Exact<{
  customerCidNumber?: Types.InputMaybe<Types.Scalars['String']['input']>;
  status?: Types.InputMaybe<Array<Types.LoanStatus>>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
  sortCreatedAt?: Types.InputMaybe<Types.SortDirection>;
}>;


export type LoansQuery = { __typename: 'Query', loans: { __typename: 'LoansPaginated', count: number, data: Array<{ __typename: 'Loan', id: string, code: string, status: Types.LoanStatus, amount: number, customerCidNumber: string | null, assetType: Types.LoanAssetType, rejectReason: string | null, createdAt: number | null, isHasLateInterestReceipt: boolean | null }> } };

declare const Document: import("graphql").DocumentNode; export default Document;