import type * as Types from '../../../graphql/types.graphql.d';

export type ProductFragment = { __typename: 'Product', _id: string, refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, name: string, code: string | null, content: string | null, displayName: string | null, image: string | null, productCode: string | null, tags: Array<string>, unit: string, price: number, minPrice: number | null, maxPrice: number | null, defaultQtyPerUse: number | null, isStockCheck: boolean | null, warningOutOfDateBeforeDays: number | null, warningOutOfStockQty: number | null, workspaceId: string, categoryId: string | null, inStock: number | null, isHiddenInReceiptWhenNoPrice: boolean | null, type: Types.ProductType, combosExpireInDays: number | null, voucherAmount: number | null, voucherExpireInDays: number | null, voucherExcludeProductIds: Array<string> | null, voucherIncludeProductIds: Array<string> | null, supplies: Array<{ __typename: 'ProductSupply', productId: string, quantity: number }> | null };


import { TypedDocumentNode } from '@apollo/client/core';
export const ProductDocument = (import("graphql").DocumentNode) as TypedDocumentNode<ProductFragment>;
export default ProductDocument 