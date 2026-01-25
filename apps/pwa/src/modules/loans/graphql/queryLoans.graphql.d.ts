import type * as Types from '../../../graphql/types.graphql.d';

export type LoansQueryVariables = Types.Exact<{
  customerCidNumber?: Types.InputMaybe<Types.Scalars['String']['input']>;
  status?: Types.InputMaybe<Array<Types.LoanStatus>>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  sortCreatedAt?: Types.InputMaybe<Types.SortDirection>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type LoansQuery = { __typename: 'Query', list: { __typename: 'LoansPaginated', total: number, results: Array<{ __typename: 'Loan', id: string, code: string, customerId: string, customerCidNumber: string | null, workspaceBranchId: string | null, amount: number, packageId: string, package: any, packagePeriodDays: number, paymentPeriods: any | null, assetType: Types.LoanAssetType, assetData: any | null, paymentProgress: any | null, metadata: any | null, status: Types.LoanStatus, rejectReason: string | null, payment: any | null, createdAt: number | null, nextReceiptAt: number | null, isHasLateInterestReceipt: boolean | null, isLiquidated: boolean | null, fulfilledAt: number | null, customer: { __typename: 'Customer', _id: string, name: string } }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const LoansDocument = (import("graphql").DocumentNode) as TypedDocumentNode<LoansQuery, LoansQueryVariables>;
export default LoansDocument 