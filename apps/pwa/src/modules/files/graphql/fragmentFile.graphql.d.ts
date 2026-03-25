import type * as Types from '../../../graphql/types.graphql.d';

export type FileFragment = { __typename: 'File', _id: string, refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, type: Types.FileType, fileName: string, path: string, thumbnail: string | null, relativePath: string | null, size: number | null, ref: string | null, uploadByUserId: string | null, url: string };


import { TypedDocumentNode } from '@apollo/client/core';
export const FileDocument = (import("graphql").DocumentNode) as TypedDocumentNode<FileFragment>;
export default FileDocument 