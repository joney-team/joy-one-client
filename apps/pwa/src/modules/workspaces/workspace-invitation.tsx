import { Button } from "@/components/buttons/button";
import { IconErrored } from "@/components/icons";
import { Image } from "@/components/image";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { renderFileUrl } from "@/modules/files/files-utils";
import { t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getWorkspaceInviteInformation } from "@/modules/workspaces/workspaces-service";
import { WorkspaceInviteInformation } from "@/modules/workspaces/workspaces-types";
import { getAvatarInitials } from "@/utils/string.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { primaryColors } from "@joy-one-client/config/colors";
import {
  Anchor,
  Avatar,
  Card,
  Center,
  createTheme,
  em,
  Group,
  Loader,
  MantineProvider,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconHeartHandshake } from "@tabler/icons-react";
import Link from "next/link";
import { FC, Fragment, useEffect } from "react";
import { Pattern } from "../../components/pattern";

export interface WorkspaceInvitationProps {
  inviteCode: string;
}

const WorkspaceInvitation: FC<WorkspaceInvitationProps> = (props) => {
  const color = useColor();
  const layout = useLayout();

  const inviteInformation = useFetch({
    fetch: async () => getWorkspaceInviteInformation(props.inviteCode),
  });

  return (
    <MantineProvider
      theme={createTheme({
        colors: { primary: primaryColors },
        primaryColor: (inviteInformation.data?.appColor || "primary") as any,
        primaryShade: (inviteInformation.data?.appColorShape || 6) as any,
      })}
    >
      <Stack
        h={layout.height}
        w={layout.width}
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        {inviteInformation.isFetching && (
          <Center h="100dvh" w="100dvw">
            <Loader type="dots" />
          </Center>
        )}

        {!!inviteInformation.error && (
          <Stack mih="100dvh" w="100dvw" align="center" justify="center">
            <Group justify="center">
              <IconErrored width={400} />
            </Group>
            <Title ta="center" fz={25}>
              {t("error_msg")}
            </Title>
            <Text c="gray" ta="center" fz={16}>
              {t("error_invite_workspace")}
            </Text>

            <Button onClick={() => inviteInformation.fetch()}>{t("retry_now")}</Button>

            <Button variant="subtle" size="xs" component={Link} href="/" color="gray">
              {t("leave")}
            </Button>
          </Stack>
        )}

        {inviteInformation.data && (
          <Fragment>
            <Pattern color={color(inviteInformation.data?.appColor || "primary")} />
            <Content invite={inviteInformation.data} {...props} />
          </Fragment>
        )}
      </Stack>
    </MantineProvider>
  );
};

const Content: FC<WorkspaceInvitationProps & { invite: WorkspaceInviteInformation }> = (props) => {
  const { invite } = props;
  const auth = useAuth();
  const workspace = useWorkspace();
  const layout = useLayout();
  const color = useColor();

  const router = useRouter();

  useEffect(() => {
    const member = workspace.userMembers.find(
      (m) => m.userId === auth.user?._id && m.workspaceId === invite.workspaceId
    );

    if (workspace.userMember?.userId === props.invite.workspaceId) {
      router.replace("/");
    } else if (member?.workspaceId) {
      workspace.select(member.workspaceId);
      router.replace("/");
    }
  }, [workspace.userMember?.userId]);

  return (
    <ScrollArea h={layout.height} w={layout.width}>
      <Stack justify="center" align="center" mih={layout.height} w="100%" py={30}>
        <Card
          p={30}
          radius={16}
          w={550}
          maw="100%"
          style={{
            boxShadow: `0 0 15px ${color(`${invite.appColor || "primary"}.4`)}`,
          }}
        >
          <Stack align="center">
            <Image src="/images/welcome.png" w={150} />
            <Title ta="center">
              {t("welcome")} {auth.user?.name}
            </Title>
            <Text ta="center">{t("invite_workspace_desc")}</Text>

            <Card withBorder shadow="none" p={10} my={16}>
              <Group>
                <Avatar
                  src={invite.logo ? renderFileUrl(invite.logo) : "/symbol.png"}
                  size={60}
                  color={invite.appColor}
                  radius={10}
                  fz={20}
                >
                  {getAvatarInitials(invite.name)}
                </Avatar>
                <Stack gap={3} pr={10}>
                  <Text fw={700}>{invite.name}</Text>
                  <Text fz={12} c="gray">
                    {t(`ws_${invite.type}`)}
                  </Text>
                </Stack>
              </Group>
            </Card>

            <Text ta="center">{t("invite_workspace_desc_1")}</Text>

            <Stack align="center" mt={16}>
              <Button
                leftIcon={IconHeartHandshake}
                onClick={() => workspace.join(props.inviteCode)}
                type="submit"
                color={invite.appColor}
                radius={100}
                size="lg"
                tt="uppercase"
              >
                {t("join_now")}
              </Button>

              <Anchor component={Link} href="/" c="gray.5" fz={em(14)}>
                {t("leave")}
              </Anchor>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </ScrollArea>
  );
};

export default WorkspaceInvitation;
