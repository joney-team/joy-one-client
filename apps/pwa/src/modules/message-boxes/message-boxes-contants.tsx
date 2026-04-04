import { MessageBoxPlatformType, MessageBoxStatus } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";

export const messageBoxStatuses: Record<
  MessageBoxStatus,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [MessageBoxStatus.Waiting]: { label: defineMessage`Waiting`, color: "gray" },
  [MessageBoxStatus.InProgress]: { label: defineMessage`In progress`, color: "primary" },
  [MessageBoxStatus.Closed]: { label: defineMessage`Closed`, color: "green" },
  [MessageBoxStatus.Expired]: { label: defineMessage`Expired`, color: "gray" },
};

export const messageBoxPlatforms: Record<
  MessageBoxPlatformType,
  {
    image: string;
    label: string;
  }
> = {
  [MessageBoxPlatformType.Zalo]: {
    image: "/images/plugins-zalo.svg",
    label: "Zalo OA",
  },
  [MessageBoxPlatformType.MetaPage]: {
    image: "/images/plugins-meta-pages.svg",
    label: "Meta Pages",
  },
  [MessageBoxPlatformType.MessageHub]: {
    image: "/images/plugins-message-hubs.svg",
    label: "Message Hubs",
  },
};
