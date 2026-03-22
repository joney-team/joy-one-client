import type * as Types from '../../../graphql/types.graphql.d';

export type UpdateAttendanceSettingMutationVariables = Types.Exact<{
  input: Types.UpdateAttendanceSettingInput;
}>;


export type UpdateAttendanceSettingMutation = { __typename: 'Mutation', updateAttendanceSetting: { __typename: 'AttendanceSetting', locations: Array<{ __typename: 'AttendanceSettingLocation', id: string, name: string | null, allowedDistanceInMeters: number, coordinates: { __typename: 'Coordinates', lat: number, lng: number } }> | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const UpdateAttendanceSettingDocument = (import("graphql").DocumentNode) as TypedDocumentNode<UpdateAttendanceSettingMutation, UpdateAttendanceSettingMutationVariables>;
export default UpdateAttendanceSettingDocument 