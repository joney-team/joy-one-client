import type * as Types from '../../../graphql/types.graphql.d';

export type RemovePluginExternalStorageMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type RemovePluginExternalStorageMutation = { __typename: 'Mutation', removePluginExternalStorage: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const RemovePluginExternalStorageDocument = (import("graphql").DocumentNode) as TypedDocumentNode<RemovePluginExternalStorageMutation, RemovePluginExternalStorageMutationVariables>;
export default RemovePluginExternalStorageDocument 