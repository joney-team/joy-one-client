import type * as Types from '../../../graphql/types.graphql.d';

export type TagFragment = { __typename: 'Tag', _id: string, name: string, color: string | null, type: Types.TagType, slug: string, order: number };


import { TypedDocumentNode } from '@apollo/client/core';
export const TagDocument = (import("graphql").DocumentNode) as TypedDocumentNode<TagFragment>;
export default TagDocument 