import type * as Types from '../../../graphql/types.graphql.d';

export type NotificationStatQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type NotificationStatQuery = { __typename: 'Query', notificationStat: { __typename: 'UserNotificationStat', count: number, unListViewed: number } };


import { TypedDocumentNode } from '@apollo/client/core';
export const NotificationStatDocument = (import("graphql").DocumentNode) as TypedDocumentNode<NotificationStatQuery, NotificationStatQueryVariables>;
export default NotificationStatDocument 