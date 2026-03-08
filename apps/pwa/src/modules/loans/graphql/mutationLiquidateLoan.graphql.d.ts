import type * as Types from '../../../graphql/types.graphql.d';

export type LiquidateLoanMutationVariables = Types.Exact<{
  liquidateLoanId: Types.Scalars['String']['input'];
}>;


export type LiquidateLoanMutation = { __typename: 'Mutation', liquidateLoan: string };


import { TypedDocumentNode } from '@apollo/client/core';
export const LiquidateLoanDocument = (import("graphql").DocumentNode) as TypedDocumentNode<LiquidateLoanMutation, LiquidateLoanMutationVariables>;
export default LiquidateLoanDocument 