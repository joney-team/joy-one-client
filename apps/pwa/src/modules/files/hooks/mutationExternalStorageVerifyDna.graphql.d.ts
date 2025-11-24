import type * as Types from '../../../graphql/types.graphql.d';

export type ExternalStorageVerifyDnaMutationVariables = Types.Exact<{
  dna: Types.Scalars['String']['input'];
}>;


export type ExternalStorageVerifyDnaMutation = { __typename: 'Mutation', externalStorageVerifyDna: { __typename: 'File', _id: string, url: string, fileName: string, externalUrl: string | null, path: string, refs: Array<string> | null, type: Types.FileType } };

declare const Document: import("graphql").DocumentNode; export default Document;