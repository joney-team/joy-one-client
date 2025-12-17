import type * as Types from '../../../graphql/types.graphql.d';

export type FetchExternalStorageSizeMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type FetchExternalStorageSizeMutation = { __typename: 'Mutation', fetchExternalStorageSize: number };

declare const Document: import("graphql").DocumentNode; export default Document;