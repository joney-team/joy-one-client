import type * as Types from '../../../graphql/types.graphql.d';

export type ProductStockRecordsQueryVariables = Types.Exact<{
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type ProductStockRecordsQuery = { __typename: 'Query', productStockRecords: { __typename: 'ProductStockRecordPaginated', total: number, results: Array<{ __typename: 'ProductStockRecord', refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, id: string, _count: number, _id: string | null, ref: string | null, stockCode: string, type: Types.ProductStockRecordType, quantity: number, productId: string, productStockId: string, relatedProductId: string | null, relatedOrderId: string | null, note: string | null, product: { __typename: 'Product', _id: string, name: string }, relatedProduct: { __typename: 'Product', _id: string, name: string } | null, createdByUser: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, email: string, phone: string | null, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, permissions: Array<string>, workingTimeType: Types.WorkspaceMemberWorkingTimeType | null, memberDisplayName: string | null, joinedAt: number | null, workspace: { __typename: 'Workspace', _id: string, code: string, type: Types.WorkspaceType, inviteCode: string | null, name: string, logo: string | null, hotline: string | null, phone: string | null, locale: Types.AppLocale | null, appIcon: string | null, appColor: string | null, appName: string | null, appDomain: string | null, appColorShape: number | null, branches: number, isArchived: boolean | null, location: { __typename: 'LocationEntity', address: string | null } | null }, workspaceBranches: Array<{ __typename: 'WorkspaceMemberWorkspaceBranchInfo', _id: string, name: string }>, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const ProductStockRecordsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<ProductStockRecordsQuery, ProductStockRecordsQueryVariables>;
export default ProductStockRecordsDocument 