"use client";

import { MembersIllustration } from "@/components/illustrations/members";
import { Image } from "@/components/image";
import { ModalHead } from "@/components/modal/modal-head";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import config from "@joy-one-client/config";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
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
import { useGenerateWorkspaceInviteCode } from "../workspaces/hooks/useGenerateWorkspaceInviteCode";

export const WorkspaceInviteMember: FC = () => {
  const isReachMemberLimit = false;

  if (isReachMemberLimit) {
    return (
      <Stack align="center" justify="center" p="md">
        <Center>
          <Image src="/images/upgrade.png" w={100} />
        </Center>

        <Text ta="center" fz={em(15)}>
          <Trans>Member limit</Trans>
        </Text>
      </Stack>
    );
  }

  return <CreateMemberInvitationLink />;
};

const CreateMemberInvitationLink: FC = () => {
  const workspace = useWorkspace();
  const invitationLink = `${config.APP_URL}/join/${workspace.member.workspace.inviteCode}`;

  const { generateWorkspaceInviteCode } = useGenerateWorkspaceInviteCode();

  return (
    <Stack align="center" p={30}>
      <MembersIllustration width={250} />

      <Text fz={em(12)} fw={500} c="dark">
        <Trans>Copy the link and send it to your teammates!</Trans>
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

          <Tooltip label={t`Regenerate link`}>
            <ActionIcon onClick={generateWorkspaceInviteCode} variant="subtle" color="gray">
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
    title: <ModalHead name={t`Invite members`} icon={IconUsersPlus} />,
    children: <WorkspaceInviteMember />,
    size: "lg",
  });
};
