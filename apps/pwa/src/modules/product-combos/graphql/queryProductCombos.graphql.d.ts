import type * as Types from '../../../graphql/types.graphql.d';

export type ProductCombosQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type ProductCombosQuery = { __typename: 'Query', list: { __typename: 'ProductCombosPaginated', total: number, results: Array<{ __typename: 'ProductCombo', refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, id: string, _count: number, _id: string | null, productId: string, customerId: string, sourceId: string, expireAt: number | null, status: Types.ProductComboStatus }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const ProductCombosDocument = (import("graphql").DocumentNode) as TypedDocumentNode<ProductCombosQuery, ProductCombosQueryVariables>;
export default ProductCombosDocument 