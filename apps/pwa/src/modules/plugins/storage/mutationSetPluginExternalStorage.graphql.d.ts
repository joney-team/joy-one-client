import type * as Types from '../../../graphql/types.graphql.d';

export type SetPluginExternalStorageMutationVariables = Types.Exact<{
  provider: Types.PluginExternalStorageProvider;
  accessKeyId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  secretAccessKey?: Types.InputMaybe<Types.Scalars['String']['input']>;
  region?: Types.InputMaybe<Types.Scalars['String']['input']>;
  bucketName?: Types.InputMaybe<Types.Scalars['String']['input']>;
  endpointUrl?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type SetPluginExternalStorageMutation = { __typename: 'Mutation', setPluginExternalStorage: { __typename: 'PluginExternalStorage', provider: Types.PluginExternalStorageProvider, region: string | null, bucketName: string | null, endpointUrl: string | null } };

declare const Document: import("graphql").DocumentNode; export default Document;