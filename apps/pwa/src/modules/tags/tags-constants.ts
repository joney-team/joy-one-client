import { t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { Icon, IconFolder, IconMessageCircle, IconStack2, IconUser } from "@tabler/icons-react";
import { TagType } from "./tags-types";

export const tagTypes: Record<TagType, { label: () => string; color: MantineColor; icon: Icon }> = {
  [TagType.CUSTOMER]: { label: () => t`Customer`, color: "blue", icon: IconUser },
  [TagType.MESSAGE_BOX]: { label: () => t`Message box`, color: "green", icon: IconMessageCircle },
  [TagType.TASK_FOLDER]: { label: () => t`Task folder`, color: "red", icon: IconFolder },
  [TagType.TASK]: { label: () => t`Task`, color: "yellow", icon: IconStack2 },
};
