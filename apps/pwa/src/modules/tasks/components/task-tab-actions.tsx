"use client";

import { Button } from "@/components/buttons/button";
import { type ModalCreateTaskRef } from "@/modules/tasks/modals/modal-create-task";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { Group } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRef, type FC } from "react";
import { useTaskFolders } from "../hooks/use-task-folders";

const ModalCreateTask = dynamic(
  () => import("@/modules/tasks/modals/modal-create-task").then((mod) => mod.ModalCreateTask),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const TaskTabActions: FC = () => {
  const { activatedFolder } = useTaskFolders();
  const modalCreateTaskRef = useRef<ModalCreateTaskRef>(null);

  return (
    <Group justify="end" wrap="nowrap" flex={1} px="md" gap={10}>
      <Button
        size="xs"
        onClick={() => modalCreateTaskRef.current?.open({ initial: { folder: activatedFolder } })}
        leftIcon={IconEdit}
      >
        <Trans>Create task</Trans>
      </Button>

      <ModalCreateTask ref={modalCreateTaskRef} />
    </Group>
  );
};
