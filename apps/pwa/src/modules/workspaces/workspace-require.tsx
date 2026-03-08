"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import {
  Anchor,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
  em,
} from "@mantine/core";
import { IconLocation, IconPlus, IconUser } from "@tabler/icons-react";
import { FC, useEffect } from "react";
import { useApp } from "../../app.context";
import { WorkspaceMemberRoleName } from "../workspace-roles/components/workspace-role-name";
import { CreateWorkspace } from "./components/create-workspace";

export const WorkspaceRequire: FC = () => {
  const workspace = useWorkspace();
  const auth = useAuth();
  const app = useApp();
  const layout = useLayout();

  useEffect(() => {
    if (app.metadata.isExtended) {
      const relatedMember = workspace.userMembers.find(
        (m) => m.workspaceId === app.metadata.workspaceId
      );
      if (relatedMember?.workspaceId) workspace.select(relatedMember.workspaceId);
    }
  }, [app.metadata]);

  if (workspace.isCreateNew)
    return (
      <Container size={600}>
        <CreateWorkspace onDone={() => workspace.setIsCreateNew(false)} />
      </Container>
    );

  if (app.metadata.isExtended) {
    const member = workspace.userMembers.find((m) => m.workspaceId === app.metadata.workspaceId);

    return (
      <Container size={500}>
        <Stack h="100%" align="center" justify="center" mih={layout.height}>
          <Stack gap={5} align="center">
            <Avatar
              w={80}
              h={80}
              workspace={{
                name: app.metadata.appName || app.metadata.title,
                logo: app.metadata.isExtended ? app.metadata.appIcon ?? "" : "/brandname.png",
                appColor: app.metadata.appColor ?? "",
              }}
              radius={10}
            />

            <Text c={app.metadata.appColor} ta="center" fz={em(25)} fw={500}>
              {app.metadata.appName}
            </Text>
          </Stack>

          {member ? (
            <Text ta="center" fz={em(15)} fw={500}>
              <Trans>Preparing everything for you. Please wait for a moment</Trans>.
            </Text>
          ) : (
            <Text ta="center" fz={em(15)} fw={500}>
              <Trans>
                You are not a member of {app.metadata.appName || "Workspace"}. Please contact the
                administrator for support
              </Trans>
            </Text>
          )}

          <Button mt={5} variant="transparent" color="gray" onClick={() => auth.signOut()} fz={11}>
            <Trans>Use another account</Trans>
          </Button>
        </Stack>
      </Container>
    );
  }

  const availabelUserMembers = workspace.userMembers.filter(
    (m) => m.workspace?.isArchived !== true
  );

  if (availabelUserMembers.length === 0) {
    return (
      <Container size={600}>
        <Stack mih={layout.height} align="center" justify="center" gap={30} py={16}>
          <Image src="/images/workspace.png" w="100%" />
          <Title fw={500} fz={30}>
            <Trans>New workspace</Trans>
          </Title>

          <Button
            onClick={() => workspace.setIsCreateNew(true)}
            leftIcon={IconPlus}
            type="submit"
            radius={100}
            size="lg"
          >
            <Trans>Start now</Trans>
          </Button>

          <Divider label={<Trans>Or</Trans>} w="80%" />

          <Text ta="center">
            <Trans>Join workspace</Trans> {auth.user?.email}
          </Text>

          <Center>
            <Anchor onClick={() => auth.signOut()} fz={11} fw={700} c="gray">
              <Trans>Logout</Trans>
            </Anchor>
          </Center>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size={500}>
      <Stack mih={layout.height} py={16} justify="center">
        <Stack gap={5}>
          <Title ta="center" fw={500} fz={30}>
            <Trans>Select</Trans> Workspace
          </Title>
          <Text ta="center" fz="xs" c="gray">
            <Trans>Company</Trans> / <Trans>Company branch</Trans>
          </Text>

          <Stack mt={30}>
            {availabelUserMembers.length === 0 && (
              <Text>
                <Trans>You don't have any workspace</Trans>
              </Text>
            )}

            {availabelUserMembers.map((userMember) => {
              if (!userMember.workspaceId) return null;

              return (
                <Card
                  key={userMember.workspaceId}
                  withBorder
                  shadow="none"
                  p={12}
                  maw="80dvw"
                  w={450}
                  onClick={() => {
                    if (!userMember.workspaceId) return;
                    workspace.select(userMember.workspaceId);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Group gap={12} wrap="nowrap" align="start">
                    <Avatar radius={5} size={46} workspace={userMember.workspace} />
                    <Stack gap={5}>
                      <Text fw={500}>{userMember.workspace.name}</Text>

                      <Group wrap="nowrap" gap={3}>
                        <ThemeIcon size="xs" variant="transparent" color="dark">
                          <IconUser strokeWidth={1.2} />
                        </ThemeIcon>
                        <Text fz="xs">
                          <WorkspaceMemberRoleName member={userMember} />
                        </Text>
                      </Group>

                      {!!userMember.workspace.location?.address && (
                        <Group wrap="nowrap" gap={3} align="start">
                          <ThemeIcon size="xs" variant="transparent" color="dark">
                            <IconLocation strokeWidth={1.2} />
                          </ThemeIcon>
                          <Text fz="xs">{userMember.workspace.location?.address}</Text>
                        </Group>
                      )}
                    </Stack>
                  </Group>
                </Card>
              );
            })}
          </Stack>

          <Stack gap={10} mt={20}>
            <Center>
              <Button
                variant="outline"
                onClick={() => workspace.setIsCreateNew(true)}
                leftSection={<IconPlus strokeWidth={1.2} />}
                type="submit"
              >
                <Trans>Create new workspace</Trans>
              </Button>
            </Center>

            <Anchor ta="center" onClick={() => auth.signOut()} fz={11} fw={700} c="gray">
              <Trans>Logout</Trans>
            </Anchor>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};
