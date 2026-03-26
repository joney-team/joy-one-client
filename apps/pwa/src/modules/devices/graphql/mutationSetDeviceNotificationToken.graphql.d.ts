import type * as Types from '../../../graphql/types.graphql.d';

export type SetDeviceNotificationTokenMutationVariables = Types.Exact<{
  input: Types.SetDeviceNotificationTokenInput;
}>;


export type SetDeviceNotificationTokenMutation = { __typename: 'Mutation', setDeviceNotificationToken: { __typename: 'Device', _id: string, source: Types.EntitySource | null, identifyId: string | null, notificationToken: string | null, locale: Types.AppLocale | null, userAgent: string, lastActiveAt: number, ua: { __typename: 'DeviceUserAgent', ua: string, browser: { __typename: 'DeviceBrowser', name: string | null, version: string | null }, device: { __typename: 'DeviceInformation', model: string | null, type: string | null, vendor: string | null }, engine: { __typename: 'DeviceEngine', name: string | null, version: string | null }, os: { __typename: 'DeviceIOS', name: string | null, version: string | null }, cpu: { __typename: 'DeviceCPU', architecture: string | null } } | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const SetDeviceNotificationTokenDocument = (import("graphql").DocumentNode) as TypedDocumentNode<SetDeviceNotificationTokenMutation, SetDeviceNotificationTokenMutationVariables>;
export default SetDeviceNotificationTokenDocument 