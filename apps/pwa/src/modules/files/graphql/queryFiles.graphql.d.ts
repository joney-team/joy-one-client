import type * as Types from '../../../graphql/types.graphql.d';

export type FilesQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type FilesQuery = { __typename: 'Query', list: { __typename: 'FilesPaginated', total: number, results: Array<{ __typename: 'File', _id: string, refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, type: Types.FileType, fileName: string, path: string, thumbnail: string | null, relativePath: string | null, size: number | null, ref: string | null, uploadByUserId: string | null, url: string }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const FilesDocument = (import("graphql").DocumentNode) as TypedDocumentNode<FilesQuery, FilesQueryVariables>;
export default FilesDocument 