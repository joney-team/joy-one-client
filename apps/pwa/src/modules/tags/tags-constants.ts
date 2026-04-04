"use client";

import { TagType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { Icon, IconFolder, IconMessageCircle, IconStack2, IconUser } from "@tabler/icons-react";

export const tagTypes: Record<
  TagType,
  { label: MacroMessageDescriptor; color: MantineColor; icon: Icon }
> = {
  [TagType.Customer]: { label: defineMessage`Customer`, color: "blue", icon: IconUser },
  [TagType.MessageBox]: {
    label: defineMessage`Message box`,
    color: "green",
    icon: IconMessageCircle,
  },
  [TagType.TaskFolder]: { label: defineMessage`Folder`, color: "red", icon: IconFolder },
  [TagType.Task]: { label: defineMessage`Task`, color: "yellow", icon: IconStack2 },
};
