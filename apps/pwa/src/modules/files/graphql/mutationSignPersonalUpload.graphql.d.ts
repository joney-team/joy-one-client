import type * as Types from '../../../graphql/types.graphql.d';

export type SignPersonalUploadMutationVariables = Types.Exact<{
  input: Types.SignUploadInput;
}>;


export type SignPersonalUploadMutation = { __typename: 'Mutation', signUpload: { __typename: 'FileUploadSigned', signedUrl: string, dna: string, isUseExternalStorage: boolean } };


import { TypedDocumentNode } from '@apollo/client/core';
export const SignPersonalUploadDocument = (import("graphql").DocumentNode) as TypedDocumentNode<SignPersonalUploadMutation, SignPersonalUploadMutationVariables>;
export default SignPersonalUploadDocument 