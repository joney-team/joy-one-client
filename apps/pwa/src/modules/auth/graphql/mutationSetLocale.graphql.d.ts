import type * as Types from '../../../graphql/types.graphql.d';

export type SetLocaleMutationVariables = Types.Exact<{
  input: Types.SetUserLocaleInput;
}>;


export type SetLocaleMutation = { __typename: 'Mutation', setLocale: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const SetLocaleDocument = (import("graphql").DocumentNode) as TypedDocumentNode<SetLocaleMutation, SetLocaleMutationVariables>;
export default SetLocaleDocument 