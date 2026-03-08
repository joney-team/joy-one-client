import type * as Types from '../../../graphql/types.graphql.d';

export type CalculateLoanPaymentPlanQueryVariables = Types.Exact<{
  input: Types.CalculateLoanPaymentPlanInput;
}>;


export type CalculateLoanPaymentPlanQuery = { __typename: 'Query', calculateLoanPaymentPlan: { __typename: 'LoanPaymentPlanResult', loanPackage: { __typename: 'LoanPackage', id: string, assetTypes: Array<Types.LoanAssetType>, type: Types.LoanPackageType, days: number, periodDaysOptions: Array<number>, contractFee: number, unFixedCapitalRates: Array<Array<number>>, description: string | null, liquidationFeeRate: number | null, lateInterestRates: Array<{ __typename: 'LateInterestRate', lateDays: number, rate: number }> }, paymentPeriods: Array<{ __typename: 'LoanPaymentPlanResultPaymentPeriod', periodDays: number, periods: Array<{ __typename: 'LoanPaymentPeriod', period: number, startTime: number, endTime: number, totalAmount: number, fee: number, capitalAmount: number, remainCapitalAmount: number, note: string | null }> }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const CalculateLoanPaymentPlanDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CalculateLoanPaymentPlanQuery, CalculateLoanPaymentPlanQueryVariables>;
export default CalculateLoanPaymentPlanDocument 