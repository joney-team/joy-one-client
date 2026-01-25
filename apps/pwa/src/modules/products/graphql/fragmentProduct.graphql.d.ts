import type * as Types from '../../../graphql/types.graphql.d';

export type ProductDataFragment = { __typename: 'Product', _id: string };


import { TypedDocumentNode } from '@apollo/client/core';
export const ProductDataDocument = (import("graphql").DocumentNode) as TypedDocumentNode<ProductDataFragment>;
export default ProductDataDocument 