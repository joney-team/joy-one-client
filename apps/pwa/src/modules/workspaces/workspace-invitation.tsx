"use client";

import { Button } from "@/components/buttons/button";
import { IconErrored } from "@/components/icons";
import { Image } from "@/components/image";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { renderFileUrl } from "@/modules/files/files-utils";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getAvatarInitials } from "@/utils/string.utils";
import { useQuery } from "@apollo/client/react";
import config from "@joy-one-client/config";
import { Trans, useLingui } from "@lingui/react/macro";
import { generateColors } from "@mantine/colors-generator";
import {
  Anchor,
  Avatar,
  Card,
  Center,
  createTheme,
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
import { Pattern } from "../../components/pattern/pattern";
import GetWorkspaceInviteInformationDocument, {
  GetWorkspaceInviteInformationQuery,
} from "./graphql/getWorkspaceInviteInformation.graphql";
import { workspaceTypes } from "./workspace-constants";

export interface WorkspaceInvitationProps {
  inviteCode: string;
}

const WorkspaceInvitationContent: FC<
  WorkspaceInvitationProps & {
    invite: GetWorkspaceInviteInformationQuery["workspaceInviteInformation"];
  }
> = (props) => {
  const { invite } = props;
  const { t } = useLingui();
  const auth = useAuth();
  const workspace = useWorkspace();
  const layout = useLayout();
  const color = useColor();

  const router = useRouter();

  useEffect(() => {
    // Redirect to workspace if already joined
    const member = workspace.userMembers.find(
      (m) => m.userId === auth.user?._id && m.workspaceId === invite.workspaceId,
    );

    if (workspace.member?.userId === props.invite.workspaceId) {
      router.replace("/");
    } else if (member?.workspaceId) {
      workspace.select(member.workspaceId);
      router.replace("/");
    }
  }, [workspace.member?.userId]);

  return (
    <ScrollArea h={layout.height} w={layout.width}>
      <Stack justify="center" align="center" mih={layout.height} w="100%" py="xl">
        <Card
          py="lg"
          px="xl"
          radius={16}
          w={550}
          maw="100%"
          style={{
            boxShadow: `0 0 15px ${color(`${invite.appColor || "primary"}.4`)}`,
          }}
        >
          <Stack align="center" gap="md">
            <Image src="/images/welcome.png" w={150} />
            <Stack gap={0}>
              <Title ta="center" order={2} fw={500}>
                <Trans>Welcome {auth.user?.name}</Trans>
              </Title>
              <Text ta="center">
                <Trans>You have been invited to join workspace</Trans>.
              </Text>
            </Stack>

            <Card withBorder shadow="none" p="xs">
              <Group gap="sm">
                <Avatar
                  src={invite.logo ? renderFileUrl(invite.logo) : "/symbol.png"}
                  color={invite.appColor ?? "primary"}
                  radius="xs"
                  size={46}
                >
                  {getAvatarInitials(invite.name)}
                </Avatar>
                <Stack gap={3} miw={200}>
                  <Text fw={700} truncate maw="100%">
                    {invite.name}
                  </Text>
                  <Text fz="sm" c="gray">
                    {t(workspaceTypes[invite.type].name)}
                  </Text>
                </Stack>
              </Group>
            </Card>

            <Text ta="center">
              <Trans>
                Let's build value together, create opportunities and develop strongly on the success
                journey of you.
              </Trans>
            </Text>

            <Stack align="center" pt="md">
              <Button
                leftIcon={IconHeartHandshake}
                onClick={() => workspace.join(props.inviteCode)}
                type="submit"
                color={invite.appColor ?? "primary"}
                radius={100}
                size="md"
              >
                <Trans>Join now</Trans>!
              </Button>

              <Anchor component={Link} href="/" c="gray.5" fz="sm">
                <Trans>Leave</Trans>
              </Anchor>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </ScrollArea>
  );
};

const WorkspaceInvitation: FC<WorkspaceInvitationProps> = (props) => {
  const color = useColor();
  const layout = useLayout();

  const { data, loading, error, refetch } = useQuery(GetWorkspaceInviteInformationDocument, {
    variables: { inviteCode: props.inviteCode },
    fetchPolicy: "network-only",
  });

  return (
    <MantineProvider
      theme={createTheme({
        colors: { primary: generateColors(config.PRIMARY_COLOR) },
        primaryColor: (data?.workspaceInviteInformation?.appColor || "primary") as any,
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
        {loading && (
          <Center h="100dvh" w="100dvw">
            <Loader type="dots" />
          </Center>
        )}

        {!!error && (
          <Stack mih="100dvh" w="100dvw" align="center" justify="center">
            <Group justify="center">
              <IconErrored width={400} />
            </Group>
            <Title ta="center" fz={25}>
              <Trans>Oops! Something went wrong...</Trans>
            </Title>
            <Text c="gray" ta="center" fz={16}>
              <Trans>The workspace is not available</Trans>
            </Text>

            <Button onClick={() => refetch()}>
              <Trans>Retry now</Trans>
            </Button>

            <Button variant="subtle" size="xs" component={Link} href="/" color="gray">
              <Trans>Leave</Trans>
            </Button>
          </Stack>
        )}

        {data?.workspaceInviteInformation && (
          <Fragment>
            <Pattern color={color(data?.workspaceInviteInformation.appColor ?? "primary")} />
            <WorkspaceInvitationContent invite={data?.workspaceInviteInformation} {...props} />
          </Fragment>
        )}
      </Stack>
    </MantineProvider>
  );
};

export default WorkspaceInvitation;
