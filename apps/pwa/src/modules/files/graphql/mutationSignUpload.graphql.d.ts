import type * as Types from '../../../graphql/types.graphql.d';

export type SignUploadMutationVariables = Types.Exact<{
  input: Types.SignUploadInput;
}>;


export type SignUploadMutation = { __typename: 'Mutation', signUpload: { __typename: 'FileUploadSigned', signedUrl: string, dna: string, isUseExternalStorage: boolean } };


import { TypedDocumentNode } from '@apollo/client/core';
export const SignUploadDocument = (import("graphql").DocumentNode) as TypedDocumentNode<SignUploadMutation, SignUploadMutationVariables>;
export default SignUploadDocument 