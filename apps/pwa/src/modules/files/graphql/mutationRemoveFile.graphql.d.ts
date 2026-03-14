import type * as Types from '../../../graphql/types.graphql.d';

export type RemoveFileMutationVariables = Types.Exact<{
  fileId: Types.Scalars['String']['input'];
}>;


export type RemoveFileMutation = { __typename: 'Mutation', removeFile: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const RemoveFileDocument = (import("graphql").DocumentNode) as TypedDocumentNode<RemoveFileMutation, RemoveFileMutationVariables>;
export default RemoveFileDocument 