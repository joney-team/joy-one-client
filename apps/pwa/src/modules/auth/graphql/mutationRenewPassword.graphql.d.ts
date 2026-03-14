import type * as Types from '../../../graphql/types.graphql.d';

export type RenewPasswordMutationVariables = Types.Exact<{
  input: Types.AuthRenewPasswordByCodeInput;
}>;


export type RenewPasswordMutation = { __typename: 'Mutation', renewPassword: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const RenewPasswordDocument = (import("graphql").DocumentNode) as TypedDocumentNode<RenewPasswordMutation, RenewPasswordMutationVariables>;
export default RenewPasswordDocument 