import type * as Types from '../../../graphql/types.graphql.d';

export type VerifyExternalStorageDnaMutationVariables = Types.Exact<{
  input: Types.VerifyExternalStorageDnaInput;
}>;


export type VerifyExternalStorageDnaMutation = { __typename: 'Mutation', verifyExternalStorageDna: { __typename: 'File', _id: string, refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, type: Types.FileType, fileName: string, path: string, thumbnail: string | null, relativePath: string | null, size: number | null, ref: string | null, uploadByUserId: string | null, url: string } };


import { TypedDocumentNode } from '@apollo/client/core';
export const VerifyExternalStorageDnaDocument = (import("graphql").DocumentNode) as TypedDocumentNode<VerifyExternalStorageDnaMutation, VerifyExternalStorageDnaMutationVariables>;
export default VerifyExternalStorageDnaDocument 