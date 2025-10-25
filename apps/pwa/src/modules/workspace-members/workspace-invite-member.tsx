"use client";

import { Button } from "@/components/buttons/button";
import { MembersIllustration } from "@/components/illustrations/members";
import { Image } from "@/components/image";
import { ModalTitle } from "@/components/modal-title";
import { tl } from "@/modules/lang/lang-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { regenerateWorkspaceInviteCode } from "@/modules/workspaces/workspaces-service";
import config from "@joy-one-client/config";
import {
  ActionIcon,
  Card,
  Center,
  CopyButton,
  Group,
  Stack,
  Text,
  Tooltip,
  em,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCheck, IconCopy, IconRefresh, IconUsersPlus } from "@tabler/icons-react";
import { FC } from "react";
import { OnModalWorkspaceSubscription } from "../workspace-subscriptions/modal-workspace-subscriptions";

export const WorkspaceInviteMember: FC = () => {
  const workspace = useWorkspace();
  const isReachMemberLimit = false;

  if (isReachMemberLimit) {
    return (
      <Stack align="center" justify="center" p={16}>
        <Center>
          <Image src="/images/upgrade.png" w={100} />
        </Center>

        <Text ta="center" fz={em(15)}>
          {tl("member_limit")}
        </Text>

        {workspace.hasPermission(WorkspacePermission.WORKSPACE_BILLINGS_MANAGER) && (
          <Button
            type="submit"
            radius={100}
            onClick={() => {
              modals.close("ModalWorkspaceInviteMember");
              OnModalWorkspaceSubscription();
            }}
          >
            {tl("upgrade_now")}!
          </Button>
        )}
      </Stack>
    );
  }

  return <CreateMemberInvitationLink />;
};

const CreateMemberInvitationLink: FC = () => {
  const workspace = useWorkspace();
  const invitationLink = `${config.APP_URL}/join/${workspace.userMember.workspace.inviteCode}`;

  return (
    <Stack align="center" p={30}>
      <MembersIllustration width={250} />

      <Text fz={em(12)} fw={500} c="dark">
        {tl("invite_member_link_desc")}
      </Text>

      <Card p={10} withBorder shadow="none">
        <Group gap={5} wrap="nowrap">
          <CopyButton value={invitationLink}>
            {({ copied, copy }) => (
              <Group gap={5} onClick={copy} style={{ maxWidth: "100%" }} wrap="nowrap">
                <Text pr={8}>{invitationLink}</Text>

                <ActionIcon onClick={copy} variant="subtle" color={copied ? "green" : "gray"}>
                  {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                </ActionIcon>
              </Group>
            )}
          </CopyButton>

          <Tooltip label={tl("regenerate_link")}>
            <ActionIcon
              onClick={() => regenerateWorkspaceInviteCode()}
              variant="subtle"
              color="gray"
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Card>
    </Stack>
  );
};

export const OnModalWorkspaceInviteMember = () => {
  return modals.open({
    modalId: "ModalWorkspaceInviteMember",
    title: <ModalTitle title={tl("invite_members")} icon={IconUsersPlus} />,
    children: <WorkspaceInviteMember />,
    size: "lg",
  });
};
