import type * as Types from '../../../graphql/types.graphql.d';

export type VerifyRenewPasswordCodeMutationVariables = Types.Exact<{
  input: Types.AuthVerifyRenewPasswordCodeInput;
}>;


export type VerifyRenewPasswordCodeMutation = { __typename: 'Mutation', verifyRenewPasswordCode: { __typename: 'VerifyRenewPasswordResult', email: string } };


import { TypedDocumentNode } from '@apollo/client/core';
export const VerifyRenewPasswordCodeDocument = (import("graphql").DocumentNode) as TypedDocumentNode<VerifyRenewPasswordCodeMutation, VerifyRenewPasswordCodeMutationVariables>;
export default VerifyRenewPasswordCodeDocument 