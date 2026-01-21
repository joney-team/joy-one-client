import type * as Types from '../../../graphql/types.graphql.d';

export type FetchExternalStorageSizeMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type FetchExternalStorageSizeMutation = { __typename: 'Mutation', fetchExternalStorageSize: number };


import { TypedDocumentNode } from '@apollo/client/core';
export const FetchExternalStorageSizeDocument = (import("graphql").DocumentNode) as TypedDocumentNode<FetchExternalStorageSizeMutation, FetchExternalStorageSizeMutationVariables>;
export default FetchExternalStorageSizeDocument 