import type * as Types from '../../../graphql/types.graphql.d';

export type SignOutOtherDevicesMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type SignOutOtherDevicesMutation = { __typename: 'Mutation', signOutOtherDevices: { __typename: 'AuthTokenResult', accessToken: string, refreshToken: string } };


import { TypedDocumentNode } from '@apollo/client/core';
export const SignOutOtherDevicesDocument = (import("graphql").DocumentNode) as TypedDocumentNode<SignOutOtherDevicesMutation, SignOutOtherDevicesMutationVariables>;
export default SignOutOtherDevicesDocument 