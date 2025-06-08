import { getGlobal } from "@/global";
import { isServer } from "@/utils/common.utils";
import config from "@joy-one-client/config";
import { type AppMetadata } from "@/types";

export const defaultMetadata: AppMetadata = {
  isExtended: false,
  title: "JoyOne",
  webURL: config.APP_URL,
  thumbnailURL: `${config.PUBLIC_URL}/thumbnail.png`,
  description: "Enjoy Work In One App",
  siteName: "Joy One App",
  type: "website",
  favicon: "/favicon.ico",
  appColor: "primary",
  appIcon: "/favicon.ico",
  appName: "JoyOne",
};

export const getMetadata = () => {
  if (isServer()) return defaultMetadata;
  const global = getGlobal();
  return (global._metadata as AppMetadata) || defaultMetadata;
};

export const setMetadata = (metadata: AppMetadata) => {
  const global = getGlobal();
  global._metadata = metadata;
  window.postMessage({ type: "change_metadata", metadata }, "*");
};
