import type * as Types from '../../../graphql/types.graphql.d';

export type AttendanceSettingFragment = { __typename: 'AttendanceSetting', locations: Array<{ __typename: 'AttendanceSettingLocation', id: string, name: string, allowedDistanceInMeters: number, coordinates: { __typename: 'Coordinates', lat: number, lng: number } }> | null };


import { TypedDocumentNode } from '@apollo/client/core';
export const AttendanceSettingDocument = (import("graphql").DocumentNode) as TypedDocumentNode<AttendanceSettingFragment>;
export default AttendanceSettingDocument 