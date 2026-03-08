import type * as Types from '../../../graphql/types.graphql.d';

export type LiquidateLoanCalculateQueryVariables = Types.Exact<{
  loanId: Types.Scalars['String']['input'];
}>;


export type LiquidateLoanCalculateQuery = { __typename: 'Query', liquidateLoanCalculate: { __typename: 'LoanLiquidationCalculated', capitalAmount: number, paidAmount: number, avancedPaymentAmount: number, remainCapitalAmount: number, remainCapitalAmountFeePercent: number, remainCapitalAmountFee: number, period: number, periodFeePerDay: number, periodFeeAmount: number, periodFeeDays: number, periodStartAt: number, feeAmount: number, lateInterestAmount: number } };


import { TypedDocumentNode } from '@apollo/client/core';
export const LiquidateLoanCalculateDocument = (import("graphql").DocumentNode) as TypedDocumentNode<LiquidateLoanCalculateQuery, LiquidateLoanCalculateQueryVariables>;
export default LiquidateLoanCalculateDocument 