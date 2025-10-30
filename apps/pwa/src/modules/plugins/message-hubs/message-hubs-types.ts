import { AppLocale } from "@/modules/lang/lang-types";

export type ChannelWidgetWelcomeInputType = "text" | "number" | "name" | "phone" | "email";

export interface ChannelWidgetWelcomeInput {
  id: string;
  type: ChannelWidgetWelcomeInputType;
  label?: string;
  fieldName?: string;
  description?: string;
  placeholder?: string;
  isRequired?: boolean;
}

export interface ChannelWidgetSettings {
  color?: string;
  position?: "left" | "right";
  chatIcon?: string;
  locale?: AppLocale;
  brandName?: string;
  brandLogo?: string;
  welcomMessage?: string;
  welcomSubMessage?: string;
  welcomeInputs?: ChannelWidgetWelcomeInput[];
}

export interface PluginMessageHubEntity {
  _id: string;
  name: string;
  webhookUrl?: string;
  widgetSettings: ChannelWidgetSettings;
  script: {
    src: string;
    html: string;
  };
  direct: {
    src: string;
  };
}

export interface PluginMessageHubDto {
  name: string;
  widgetSettings: ChannelWidgetSettings;
}
