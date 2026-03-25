import type * as Types from '../../../graphql/types.graphql.d';

export type DeviceFragment = { __typename: 'Device', _id: string, source: Types.EntitySource | null, identifyId: string | null, notificationToken: string | null, locale: Types.AppLocale | null, userAgent: string, lastActiveAt: number };


import { TypedDocumentNode } from '@apollo/client/core';
export const DeviceDocument = (import("graphql").DocumentNode) as TypedDocumentNode<DeviceFragment>;
export default DeviceDocument 