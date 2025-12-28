import type * as Types from '../../../graphql/types.graphql.d';

export type PluginExternalStorageSignUploadUrlMutationVariables = Types.Exact<{
  fileName: Types.Scalars['String']['input'];
  refs?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  id?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type PluginExternalStorageSignUploadUrlMutation = { __typename: 'Mutation', pluginExternalStorageSignUploadUrl: { __typename: 'SignUploadUrlResponse', dna: string, signedUrl: string } };

declare const Document: import("graphql").DocumentNode; export default Document;