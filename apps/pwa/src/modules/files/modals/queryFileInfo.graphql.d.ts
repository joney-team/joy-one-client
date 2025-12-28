import type * as Types from '../../../graphql/types.graphql.d';

export type GetFileInfoQueryVariables = Types.Exact<{
  fileId: Types.Scalars['String']['input'];
}>;


export type GetFileInfoQuery = { __typename: 'Query', getFileInfo: { __typename: 'File', _id: string, refs: Array<string> | null, size: number | null, fileName: string, path: string, url: string, externalUrl: string | null } };

declare const Document: import("graphql").DocumentNode; export default Document;