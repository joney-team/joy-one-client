"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { useAuth } from "@/modules/auth/auth-context";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { transferOwner } from "@/modules/workspace-roles/workspace-roles-service";
import { onError } from "@/utils/exceptions.utils";
import { Trans } from "@lingui/react/macro";
import { Card, Center, Stack, Text, em } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconUser } from "@tabler/icons-react";
import { FC, useState } from "react";

export const ModalTransferWorkspaceOwner: FC = () => {
  const auth = useAuth();
  const [newOwner, setNewOwner] = useState<WorkspaceMemberInfo>();

  const onSubmit = async () => {
    if (!newOwner) return;
    await transferOwner({ userId: newOwner.userId })
      .then(() => modals.close("ModalWorkspaceMember"))
      .catch(onError);
  };

  return (
    <Stack gap={10} align="stretch">
      <Card p={10} withBorder>
        <Stack align="center">
          <Text fz={em(13)} fw={500} ta="center">
            <Trans>Select member</Trans>
          </Text>
          <WorkspaceMembersInput
            excludeIds={[auth.user._id]}
            value={newOwner ? [newOwner] : []}
            onChange={(users) => {
              setNewOwner(users[0]);
            }}
          />
        </Stack>
      </Card>

      <Center mt={10}>
        <Button radius={100} onClick={onSubmit}>
          <Trans>Confirm</Trans>
        </Button>
      </Center>
    </Stack>
  );
};

export const OnModalTransferOwner = () =>
  modals.open({
    modalId: "ModalWorkspaceMember",
    title: <ModalTitle title={<Trans>Transfer ownership</Trans>} icon={IconUser} />,
    children: <ModalTransferWorkspaceOwner />,
  });
