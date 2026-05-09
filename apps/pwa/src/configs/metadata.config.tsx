import { type PageMetadata } from "@/types";
import config from "@joy-one/config";

export const defaultMetadata: PageMetadata = {
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
