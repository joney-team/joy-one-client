"use client";

import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { Icon, IconFolder, IconMessageCircle, IconStack2, IconUser } from "@tabler/icons-react";
import { TagType } from "./tags-types";

export const tagTypes: Record<
  TagType,
  { label: MacroMessageDescriptor; color: MantineColor; icon: Icon }
> = {
  [TagType.CUSTOMER]: { label: defineMessage`Customer`, color: "blue", icon: IconUser },
  [TagType.MESSAGE_BOX]: {
    label: defineMessage`Message box`,
    color: "green",
    icon: IconMessageCircle,
  },
  [TagType.TASK_FOLDER]: { label: defineMessage`Folder`, color: "red", icon: IconFolder },
  [TagType.TASK]: { label: defineMessage`Task`, color: "yellow", icon: IconStack2 },
};
