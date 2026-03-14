import type * as Types from '../../../graphql/types.graphql.d';

export type PluginExternalStorageQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type PluginExternalStorageQuery = { __typename: 'Query', pluginExternalStorage: { __typename: 'PluginExternalStorage', isDisabled: boolean | null } | null };


import { TypedDocumentNode } from '@apollo/client/core';
export const PluginExternalStorageDocument = (import("graphql").DocumentNode) as TypedDocumentNode<PluginExternalStorageQuery, PluginExternalStorageQueryVariables>;
export default PluginExternalStorageDocument 