import type * as Types from '../../../graphql/types.graphql.d';

export type RequestRenewPasswordMutationVariables = Types.Exact<{
  input: Types.AuthRequestRenewUserPasswordInput;
}>;


export type RequestRenewPasswordMutation = { __typename: 'Mutation', requestRenewPassword: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const RequestRenewPasswordDocument = (import("graphql").DocumentNode) as TypedDocumentNode<RequestRenewPasswordMutation, RequestRenewPasswordMutationVariables>;
export default RequestRenewPasswordDocument 