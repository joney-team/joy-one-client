import type * as Types from '../../../graphql/types.graphql.d';

export type NotificationsQueryVariables = Types.Exact<{
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  ids?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
}>;


export type NotificationsQuery = { __typename: 'Query', list: { __typename: 'NotificationsPaginated', total: number, results: Array<{ __typename: 'Notification', _id: string, icon: Types.NotificationIcon | null, title: string, titleParams: any | null, body: string, bodyParams: any | null, route: string | null, image: string | null, type: Types.NotificationType, status: Types.NotificationStatus, createdAt: number | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const NotificationsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<NotificationsQuery, NotificationsQueryVariables>;
export default NotificationsDocument 