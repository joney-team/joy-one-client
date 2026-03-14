import type * as Types from '../../../graphql/types.graphql.d';

export type CategoriesQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type CategoriesQuery = { __typename: 'Query', list: { __typename: 'CategoriesPaginated', total: number, results: Array<{ __typename: 'Category', _id: string, type: Types.CategoryType, refs: Array<string> | null, name: string, slug: string, icon: string | null, thumbnail: string | null, description: string | null, parentId: string | null, order: number, createdAt: number | null, updatedAt: number | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const CategoriesDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CategoriesQuery, CategoriesQueryVariables>;
export default CategoriesDocument 