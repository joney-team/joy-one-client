import type * as Types from '../../../graphql/types.graphql.d';

export type GetDeviceByIdentifyIdQueryVariables = Types.Exact<{
  identifyId: Types.Scalars['String']['input'];
}>;


export type GetDeviceByIdentifyIdQuery = { __typename: 'Query', getDeviceByIdentifyId: { __typename: 'Device', _id: string, source: Types.EntitySource | null, identifyId: string | null, notificationToken: string | null, locale: Types.AppLocale | null, userAgent: string, lastActiveAt: number } };


import { TypedDocumentNode } from '@apollo/client/core';
export const GetDeviceByIdentifyIdDocument = (import("graphql").DocumentNode) as TypedDocumentNode<GetDeviceByIdentifyIdQuery, GetDeviceByIdentifyIdQueryVariables>;
export default GetDeviceByIdentifyIdDocument 