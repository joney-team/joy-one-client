import { t } from "@lingui/core/macro";
import { MantineColor } from "@mantine/core";
import { HrmTimekeepingType } from "./hrm-timekeepings-types";
import { Icon, IconLogin, IconLogout } from "@tabler/icons-react";

export const hrmTimekeepingTypes: Record<
  HrmTimekeepingType,
  { name: () => string; color: MantineColor; icon: Icon }
> = {
  [HrmTimekeepingType.CHECK_IN]: { name: () => t`Check in`, color: "primary", icon: IconLogin },
  [HrmTimekeepingType.CHECK_OUT]: { name: () => t`Check out`, color: "orange.8", icon: IconLogout },
};
