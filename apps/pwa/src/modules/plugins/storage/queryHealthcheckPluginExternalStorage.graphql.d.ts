import type * as Types from '../../../graphql/types.graphql.d';

export type HealthcheckPluginExternalStorageMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type HealthcheckPluginExternalStorageMutation = { __typename: 'Mutation', healthcheckPluginExternalStorage: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const HealthcheckPluginExternalStorageDocument = (import("graphql").DocumentNode) as TypedDocumentNode<HealthcheckPluginExternalStorageMutation, HealthcheckPluginExternalStorageMutationVariables>;
export default HealthcheckPluginExternalStorageDocument 