import type * as Types from '../../../graphql/types.graphql.d';

export type PluginExternalStorageQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type PluginExternalStorageQuery = { __typename: 'Query', pluginExternalStorage: { __typename: 'PluginExternalStorage', provider: Types.PluginExternalStorageProvider, region: string | null, bucketName: string | null, endpointUrl: string | null, size: number | null, isDisabled: boolean | null } | null };

declare const Document: import("graphql").DocumentNode; export default Document;