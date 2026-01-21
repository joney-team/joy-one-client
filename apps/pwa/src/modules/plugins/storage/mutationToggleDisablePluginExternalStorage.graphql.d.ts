import type * as Types from '../../../graphql/types.graphql.d';

export type ToggleDisablePluginExternalStorageMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type ToggleDisablePluginExternalStorageMutation = { __typename: 'Mutation', toggleDisablePluginExternalStorage: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const ToggleDisablePluginExternalStorageDocument = (import("graphql").DocumentNode) as TypedDocumentNode<ToggleDisablePluginExternalStorageMutation, ToggleDisablePluginExternalStorageMutationVariables>;
export default ToggleDisablePluginExternalStorageDocument 