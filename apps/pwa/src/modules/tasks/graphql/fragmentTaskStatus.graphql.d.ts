import type * as Types from '../../../graphql/types.graphql.d';

export type TaskStatusDataFragment = { __typename: 'TaskStatus', id: string, name: string | null, color: string | null, order: number, progress: number, contextId: string | null, contextType: Types.TaskContextType | null };

declare const Document: import("graphql").DocumentNode; export default Document;