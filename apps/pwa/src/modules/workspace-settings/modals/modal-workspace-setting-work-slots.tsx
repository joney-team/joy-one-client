"use client";

import { WorkSlot } from "@/types";
import { WorkSlotsSettingsInput } from "@/components/inputs/work-slot-settings-input";
import { ModalTitle } from "@/components/modal-title";
import { getView } from "@/layout/layout-service";
import { t } from "@/modules/lang/lang-service";
import { setWorkspaceSettings } from "@/modules/workspace-settings/workspace-settings-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { em, Stack, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconCalendarWeek } from "@tabler/icons-react";
import { FC, useState } from "react";

export const ModalWorkspaceSettingsWorkSlots: FC = () => {
  const workspace = useWorkspace();
  const [slots, setSlots] = useState(workspace.settings.wSlots || []);

  const onUpdate = useDebouncedCallback((slots: WorkSlot[]) => {
    setWorkspaceSettings({
      ...workspace.settings,
      wSlots: slots,
    });
  }, 500);

  return (
    <>
      <Stack>
        <Stack gap={5}>
          <Text fz={em(12)}>• {t("work-slot-desc-1")}</Text>

          <Text fz={em(12)}>• {t("work-slot-desc-2")}</Text>
        </Stack>

        <WorkSlotsSettingsInput
          slots={slots}
          onChange={(s) => {
            setSlots(s);
            onUpdate(s);
          }}
        />
      </Stack>
    </>
  );
};

export const OnModalWorkspaceSettingsWorkSlots = () => {
  return modals.open({
    modalId: "ModalWorkspaceSettingsWorkSlots",
    title: <ModalTitle title={t("work_slots")} icon={IconCalendarWeek} />,
    children: <ModalWorkspaceSettingsWorkSlots />,
    size: "xl",
    fullScreen: getView() === "mobile",
  });
};
