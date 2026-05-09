import config from "@joy-one/config";
import { AppConfigFragment } from "./configs/fragmentAppConfig.graphql";
import GetAppConfigDocument from "./configs/getAppConfig.graphql";
import { graphqlClient } from "./graphql/graphql-client";

export async function getAppConfig(): Promise<AppConfigFragment> {
  const result = await graphqlClient.query({
    query: GetAppConfigDocument,
  });

  return result.data?.appConfig!;
}

export function isExtendedApp() {
  return process.env["NEXT_PUBLIC_EXTENDED_APP"] === "true";
}

export function isDevelopment() {
  return (config.ENV as string) === "development";
}
