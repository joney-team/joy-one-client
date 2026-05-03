import { graphqlServerClient } from "@/graphql/graphql-server";
import { AppMetadata } from "@/graphql/types.graphql";
import GetAppMetadataDocument, {
  GetAppMetadataQueryVariables,
} from "./graphql/getAppMetadata.graphql";
import { defaultAppMetadata } from "./metadata-constants";

export async function getAppMetadata(
  variables?: GetAppMetadataQueryVariables,
): Promise<AppMetadata> {
  try {
    const result = await graphqlServerClient.query({
      query: GetAppMetadataDocument,
      variables,
      fetchPolicy: "network-only",
    });

    return result.data?.appMetadata ?? defaultAppMetadata;
  } catch {
    return defaultAppMetadata;
  }
}
