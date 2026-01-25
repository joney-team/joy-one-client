import type * as Types from '../../../graphql/types.graphql.d';

export type PostsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type PostsQuery = { __typename: 'Query', list: { __typename: 'PostsPaginated', total: number, results: Array<{ __typename: 'Posts', refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, _id: string, title: string, slug: string, excerpt: string | null, content: any | null, contentHtml: string | null, thumbnail: string | null, meta: any | null, publishedAt: number | null, categoryId: string | null, productId: string | null, customFieldValues: Array<{ __typename: 'CustomFieldValue', customFieldId: string, value: any | null }> | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const PostsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<PostsQuery, PostsQueryVariables>;
export default PostsDocument 