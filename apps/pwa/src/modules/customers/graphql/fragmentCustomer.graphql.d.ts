import type * as Types from '../../../graphql/types.graphql.d';

export type CustomerDataFragment = { __typename: 'Customer', refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, _id: string, code: string, codePrefix: string, plainCode: string | null, name: string, birthday: number | null, birthdayDate: number | null, birthdayMonth: number | null, phone: string | null, avatar: string | null, email: string | null, presenterCustomerId: string | null, gender: Types.Gender | null, medicalHistory: Array<string> | null, assigneeUserIds: Array<string> | null, tagIds: Array<string> | null, salaryAmount: number | null, relatedCustomerIds: Array<string> | null };

declare const Document: import("graphql").DocumentNode; export default Document;