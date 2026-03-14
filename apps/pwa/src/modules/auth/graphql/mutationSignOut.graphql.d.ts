import type * as Types from '../../../graphql/types.graphql.d';

export type SignOutMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type SignOutMutation = { __typename: 'Mutation', signOut: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const SignOutDocument = (import("graphql").DocumentNode) as TypedDocumentNode<SignOutMutation, SignOutMutationVariables>;
export default SignOutDocument 