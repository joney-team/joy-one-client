import type * as Types from '../../../graphql/types.graphql.d';

export type DevicesQueryVariables = Types.Exact<{
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type DevicesQuery = { __typename: 'Query', devices: { __typename: 'DevicesPaginated', total: number, results: Array<{ __typename: 'Device', _id: string, source: Types.EntitySource | null, identifyId: string | null, notificationToken: string | null, locale: Types.AppLocale | null, userAgent: string, lastActiveAt: number, ua: { __typename: 'DeviceUserAgent', ua: string, browser: { __typename: 'DeviceBrowser', name: string | null, version: string | null }, device: { __typename: 'DeviceInformation', model: string | null, type: string | null, vendor: string | null }, engine: { __typename: 'DeviceEngine', name: string | null, version: string | null }, os: { __typename: 'DeviceIOS', name: string | null, version: string | null }, cpu: { __typename: 'DeviceCPU', architecture: string | null } } | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const DevicesDocument = (import("graphql").DocumentNode) as TypedDocumentNode<DevicesQuery, DevicesQueryVariables>;
export default DevicesDocument 