import config from "@joy-one-client/config";
import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { regenerateWorkspaceInviteCode } from "@/modules/workspaces/workspaces-service";
import { ActionIcon, Card, Center, CopyButton, Group, Stack, Text, Tooltip, em } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCheck, IconCopy, IconRefresh, IconUsersPlus } from "@tabler/icons-react";
import { FC } from "react";
import { OnModalWorkspaceSubscription } from "../workspace-subscriptions/modal-workspace-subscriptions";
import { MembersIllustration } from "@/components/illustrations/members";

export const WorkspaceInviteMember: FC = () => {
  const workspace = useWorkspace();
  const isReachMemberLimit =
    workspace.workspaceSubscription &&
    workspace.workspaceSubscription.subscription.limitMembers > 0 &&
    workspace.workspaceSubscription?.stat.totalMembers >= workspace.workspaceSubscription?.subscription.limitMembers;

  if (isReachMemberLimit) {
    return (
      <Stack align="center" justify="center" p={16}>
        <Center>
          <Image src="/images/upgrade.png" w={100} />
        </Center>

        <Text ta="center" fz={em(15)}>
          {t("member_limit")}
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
            {t("upgrade_now")}!
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

  const onRegenerateInviteCode = async () => {
    return regenerateWorkspaceInviteCode();
  };

  return (
    <Stack align="center" p={30}>
      <MembersIllustration width={250} />

      <Text fz={em(12)} fw={500} c="dark">
        {t("invite_member_link_desc")}
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

          <Tooltip label={t("regenerate_link")}>
            <ActionIcon onClick={onRegenerateInviteCode} variant="subtle" color="gray">
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
    title: <ModalTitle title={t("invite_members")} icon={IconUsersPlus} />,
    children: <WorkspaceInviteMember />,
    size: "lg",
  });
};
