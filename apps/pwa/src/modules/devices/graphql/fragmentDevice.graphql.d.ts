import type * as Types from '../../../graphql/types.graphql.d';

export type DeviceDataFragment = { __typename: 'Device', _id: string, source: Types.EntitySource | null, identifyId: string | null, notificationToken: string | null, locale: Types.AppLocale | null, userAgent: string, lastActiveAt: number };


import { TypedDocumentNode } from '@apollo/client/core';
export const DeviceDataDocument = (import("graphql").DocumentNode) as TypedDocumentNode<DeviceDataFragment>;
export default DeviceDataDocument 