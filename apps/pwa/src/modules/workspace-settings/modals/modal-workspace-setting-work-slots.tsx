"use client";

import { WorkSlotsSettingsInput } from "@/components/inputs/work-slot-settings-input";
import { ModalHead } from "@/components/modal/modal-head";
import { getView } from "@/layout/layout-service";
import { WorkSlot } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { em, Stack, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconCalendarWeek } from "@tabler/icons-react";
import { FC, useState } from "react";
import { useWorkspaceSetting } from "../hooks/use-workspace-setting";

export const ModalWorkspaceSettingsWorkSlots: FC = () => {
  const { workspaceSetting } = useWorkspaceSetting();
  const [slots, setSlots] = useState(workspaceSetting?.wSlots || []);

  const onUpdate = useDebouncedCallback((slots: WorkSlot[]) => {
    // TODO: Move from wSlots to schedule
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
    title: <ModalHead name={t`Work schedule`} icon={IconCalendarWeek} />,
    children: <ModalWorkspaceSettingsWorkSlots />,
    size: "xl",
    fullScreen: getView() === "mobile",
  });
};
