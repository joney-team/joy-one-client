import type * as Types from '../../../graphql/types.graphql.d';

export type RegisterDeviceMutationVariables = Types.Exact<{
  input: Types.RegisterDeviceInput;
}>;


export type RegisterDeviceMutation = { __typename: 'Mutation', registerDevice: { __typename: 'Device', _id: string, source: Types.EntitySource | null, identifyId: string | null, notificationToken: string | null, locale: Types.AppLocale | null, userAgent: string, lastActiveAt: number } };


import { TypedDocumentNode } from '@apollo/client/core';
export const RegisterDeviceDocument = (import("graphql").DocumentNode) as TypedDocumentNode<RegisterDeviceMutation, RegisterDeviceMutationVariables>;
export default RegisterDeviceDocument 