import QUERY_APP_CONFIG from "@/configs/queryAppConfig.graphql";
import config from "@joy-one-client/config";
import { AppConfigFragment } from "./configs/fragmentAppConfig.graphql";
import { apolloClient } from "./modules/apollo/apollo-client";

export async function getAppConfig(): Promise<AppConfigFragment> {
  const result = await apolloClient.query({
    query: QUERY_APP_CONFIG,
  });

  return result.data?.appConfig!;
}

export function isExtendedApp() {
  return process.env["NEXT_PUBLIC_EXTENDED_APP"] === "true";
}

export function isDevelopment() {
  return (config.ENV as string) === "development";
}
