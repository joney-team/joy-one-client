import type * as Types from '../../../graphql/types.graphql.d';

export type TagsQueryVariables = Types.Exact<{
  type?: Types.InputMaybe<Types.Scalars['String']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  ids?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
}>;


export type TagsQuery = { __typename: 'Query', tags: { __typename: 'Tags', count: number, data: Array<{ __typename: 'Tag', _id: string, name: string, color: string | null, type: Types.TagType, slug: string, order: number }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const TagsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<TagsQuery, TagsQueryVariables>;
export default TagsDocument 