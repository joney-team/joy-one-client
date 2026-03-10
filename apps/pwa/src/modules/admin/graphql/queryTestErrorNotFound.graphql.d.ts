import type * as Types from '../../../graphql/types.graphql.d';

export type TestErrorNotFoundQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type TestErrorNotFoundQuery = { __typename: 'Query', testErrorNotFound: string };


import { TypedDocumentNode } from '@apollo/client/core';
export const TestErrorNotFoundDocument = (import("graphql").DocumentNode) as TypedDocumentNode<TestErrorNotFoundQuery, TestErrorNotFoundQueryVariables>;
export default TestErrorNotFoundDocument 