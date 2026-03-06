import type * as Types from '../../../graphql/types.graphql.d';

export type CustomerDataFragment = { __typename: 'Customer', _id: string, refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, code: string, codePrefix: string | null, plainCode: string | null, name: string, birthday: number | null, birthdayDate: number | null, birthdayMonth: number | null, phone: string | null, avatar: string | null, email: string | null, presenterCustomerId: string | null, gender: Types.Gender | null, medicalHistory: Array<string> | null, assigneeUserIds: Array<string> | null, tagIds: Array<string> | null, salaryAmount: number | null, relatedCustomerIds: Array<string> | null, lastCheckin: number | null, workspaceBranchId: string | null };


import { TypedDocumentNode } from '@apollo/client/core';
export const CustomerDataDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CustomerDataFragment>;
export default CustomerDataDocument 