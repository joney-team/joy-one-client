import type * as Types from '../../../graphql/types.graphql.d';

export type ProductStocksQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type ProductStocksQuery = { __typename: 'Query', productStocks: { __typename: 'ProductStocksPaginated', total: number, results: Array<{ __typename: 'ProductStock', refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, id: string, _count: number, _id: string | null, code: string | null, productId: string, quantity: number, remainQuantity: number, expireAt: number, costPrice: number, note: string | null, records: any, product: { __typename: 'Product', _id: string, name: string }, createdByUser: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, email: string, phone: string | null, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, permissions: Array<string>, workingTimeType: Types.WorkspaceMemberWorkingTimeType | null, memberDisplayName: string | null, joinedAt: number | null, workspace: { __typename: 'Workspace', _id: string, code: string, type: Types.WorkspaceType, inviteCode: string | null, name: string, logo: string | null, hotline: string | null, phone: string | null, locale: Types.AppLocale | null, appIcon: string | null, appColor: string | null, appName: string | null, appDomain: string | null, appColorShape: number | null, branches: number, isArchived: boolean | null, location: { __typename: 'LocationEntity', address: string | null } | null }, workspaceBranches: Array<{ __typename: 'WorkspaceMemberWorkspaceBranchInfo', _id: string, name: string }>, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const ProductStocksDocument = (import("graphql").DocumentNode) as TypedDocumentNode<ProductStocksQuery, ProductStocksQueryVariables>;
export default ProductStocksDocument 