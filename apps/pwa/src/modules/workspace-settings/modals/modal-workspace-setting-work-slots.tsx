"use client";

import { WorkSlot } from "@/types";
import { WorkSlotsSettingsInput } from "@/components/inputs/work-slot-settings-input";
import { ModalTitle } from "@/components/modal-title";
import { getView } from "@/layout/layout-service";
import { setWorkspaceSettings } from "@/modules/workspace-settings/workspace-settings-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { em, Stack, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconCalendarWeek } from "@tabler/icons-react";
import { FC, useState } from "react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

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
    <Stack>
      <Stack gap={5}>
        <Text fz={em(12)}>
          • <Trans>Specify the working time, bookings can only be booked in these time slots</Trans>
        </Text>

        <Text fz={em(12)}>
          •{" "}
          <Trans>
            Drag to select time slots. Click to view details and specify working shifts or delete
            time slots
          </Trans>
        </Text>
      </Stack>

      <WorkSlotsSettingsInput
        slots={slots}
        onChange={(s) => {
          setSlots(s);
          onUpdate(s);
        }}
      />
    </Stack>
  );
};

export const OnModalWorkspaceSettingsWorkSlots = () => {
  return modals.open({
    modalId: "ModalWorkspaceSettingsWorkSlots",
    title: <ModalTitle title={t`Work schedule`} icon={IconCalendarWeek} />,
    children: <ModalWorkspaceSettingsWorkSlots />,
    size: "xl",
    fullScreen: getView() === "mobile",
  });
};
