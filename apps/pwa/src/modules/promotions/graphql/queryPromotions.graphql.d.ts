import type * as Types from '../../../graphql/types.graphql.d';

export type PromotionsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type PromotionsQuery = { __typename: 'Query', list: { __typename: 'PromotionsPaginated', total: number, results: Array<{ __typename: 'Promotion', refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, id: string, _count: number, _id: string | null, name: string, description: string | null, image: string | null, limitPerCustomer: number | null, type: Types.PromotionType, value: number, productsSelection: any | null, customersSelection: any | null, expireAt: number | null, status: Types.PromotionStatus }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const PromotionsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<PromotionsQuery, PromotionsQueryVariables>;
export default PromotionsDocument 