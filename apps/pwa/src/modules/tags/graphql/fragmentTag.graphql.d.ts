import type * as Types from '../../../graphql/types.graphql.d';

export type TagDataFragment = { __typename: 'Tag', _id: string, name: string, color: string | null, type: Types.TagType, slug: string, order: number };


import { TypedDocumentNode } from '@apollo/client/core';
export const TagDataDocument = (import("graphql").DocumentNode) as TypedDocumentNode<TagDataFragment>;
export default TagDataDocument 