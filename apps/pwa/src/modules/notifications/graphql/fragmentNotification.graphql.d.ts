import type * as Types from '../../../graphql/types.graphql.d';

export type NotificationFragment = { __typename: 'Notification', _id: string, icon: Types.NotificationIcon | null, title: string, titleParams: any | null, body: string, bodyParams: any | null, route: string | null, image: string | null, type: Types.NotificationType, status: Types.NotificationStatus, createdAt: number | null };


import { TypedDocumentNode } from '@apollo/client/core';
export const NotificationDocument = (import("graphql").DocumentNode) as TypedDocumentNode<NotificationFragment>;
export default NotificationDocument 