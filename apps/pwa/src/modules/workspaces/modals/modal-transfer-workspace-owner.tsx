"use client";

import { Button } from "@/components/buttons/button";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { ModalTitle } from "@/components/modal-title";
import { useAuth } from "@/modules/auth/auth-context";
import { t } from "@/modules/lang/lang-service";
import { WorkspaceMemberInfo } from "@/modules/workspace-members/workspace-members-types";
import { transferOwner } from "@/modules/workspace-roles/workspace-roles-service";
import { onError } from "@/utils/exceptions.utils";
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
            {t("select_member")}
          </Text>
          <WorkspaceMembersInput
            ignoreUserIds={[auth.user._id]}
            value={newOwner ? [newOwner] : []}
            length={1}
            onChange={(users) => {
              setNewOwner(users[0]);
            }}
          />
        </Stack>
      </Card>

      <Center mt={10}>
        <Button radius={100} onClick={onSubmit}>
          {t("confirm")}
        </Button>
      </Center>
    </Stack>
  );
};

export const OnModalTransferOwner = () =>
  modals.open({
    modalId: "ModalWorkspaceMember",
    title: <ModalTitle title={t("transfer_ownership")} icon={IconUser} />,
    children: <ModalTransferWorkspaceOwner />,
  });
