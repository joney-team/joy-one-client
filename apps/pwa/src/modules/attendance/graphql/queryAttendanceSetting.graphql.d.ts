import type * as Types from '../../../graphql/types.graphql.d';

export type AttendanceSettingQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AttendanceSettingQuery = { __typename: 'Query', attendanceSetting: { __typename: 'AttendanceSetting', locations: Array<{ __typename: 'AttendanceSettingLocation', id: string, name: string, allowedDistanceInMeters: number, coordinates: { __typename: 'Coordinates', lat: number, lng: number } }> | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const AttendanceSettingDocument = (import("graphql").DocumentNode) as TypedDocumentNode<AttendanceSettingQuery, AttendanceSettingQueryVariables>;
export default AttendanceSettingDocument 