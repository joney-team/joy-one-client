import { PluginExternalStorageProvider } from "@/graphql/enums.graphql";

export const pluginStorageProviders: Record<
  PluginExternalStorageProvider,
  {
    name: string;
  }
> = {
  [PluginExternalStorageProvider.AwsS3]: {
    name: "AWS S3",
  },
};
