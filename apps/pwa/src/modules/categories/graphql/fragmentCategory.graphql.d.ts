import type * as Types from '../../../graphql/types.graphql.d';

export type CategoryDataFragment = { __typename: 'Category', _id: string, type: Types.CategoryType, refs: Array<string> | null, name: string, slug: string, icon: string | null, thumbnail: string | null, description: string | null, parentId: string | null, order: number, createdAt: number | null, updatedAt: number | null };


import { TypedDocumentNode } from '@apollo/client/core';
export const CategoryDataDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CategoryDataFragment>;
export default CategoryDataDocument 