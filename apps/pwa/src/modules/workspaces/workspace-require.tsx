"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { useLang } from "@/modules/lang/lang-context";
import { LocationEntity } from "@/modules/locations/locations-types";
import { WorkspaceTypeItem } from "@/modules/workspaces/components/workpsace-type-item";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { onError } from "@/utils/exceptions.utils";
import { String } from "@/utils/string.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Anchor,
  Card,
  Center,
  Container,
  Divider,
  Group,
  InputWrapper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  em,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCheck, IconInfoCircle, IconLocation, IconPlus, IconUser } from "@tabler/icons-react";
import { ChangeEventHandler, FC, useEffect, useState } from "react";
import { useApp } from "../../app.context";
import { api } from "../apis";
import { getWorkspaceMemberRoleLabel } from "../workspace-members/workspace-members-service";
import { workspaceTypes } from "./workspace-constants";

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
        <CreateWorkspaceForm onDone={() => workspace.setIsCreateNew(false)} />
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
                appName: app.metadata.appName ?? "",
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

  if (availabelUserMembers.length === 0)
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
                  withBorder
                  shadow="none"
                  p={12}
                  maw="80dvw"
                  w={450}
                  key={userMember.workspaceId}
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
                        <Text fz="xs">{getWorkspaceMemberRoleLabel(userMember)}</Text>
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

export const CreateWorkspaceForm: FC<{ onDone: () => void }> = (props) => {
  const workspace = useWorkspace();
  const lang = useLang();
  const layout = useLayout();
  const { t } = useLingui();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      logo: "",
      name: "",
      location: {} as LocationEntity,
      hotline: "",
      phone: "",
      code: "",
      type: Object.values(WorkspaceType)[0],
      locale: lang.locale,
    },
    validate: {
      name: (value: string) => {
        if (!value) return t`Must be provided`;
      },
      code: (value: string) => {
        if (!value) return t`Must be provided`;
        if (!/^[A-Z0-9]+$/.test(value)) return t`Invalid workspace code`;
      },
      type: (value: WorkspaceType) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    await workspace
      .create(values)
      .then(props.onDone)
      .catch(onError)
      .finally(() => setIsSubmitting(false));
  });

  const onAutoFillCode = useDebouncedCallback((name: string) => {
    if (name.length === 0) return;

    api
      .post(`/workspaces/random-code`, { name })
      .then((res) => form.setFieldValue("code", res.result))
      .catch(() => false);
  }, 300);

  const onChangeName: ChangeEventHandler<HTMLInputElement> = (e) => {
    const name = e.target.value;
    form.setFieldValue("name", name);
    onAutoFillCode(name);
  };

  return (
    <Stack mih={layout.height} justify="center" gap={20} py={16}>
      <Image src="/images/workspace.png" w={250} />

      <Stack gap={3}>
        <Title ta="center" fw={500} fz={30}>
          {t`Create`} Workspace
        </Title>
        <Text ta="center" fz="xs" c="gray">
          {t`Company`} / {t`Company branch`}
        </Text>
      </Stack>

      <Stack>
        <Group align="start">
          <TextInput
            flex={1}
            label={t`Name`}
            placeholder="Gold Dental"
            {...form.getInputProps("name")}
            onChange={onChangeName}
          />

          <TextInput
            label={
              <Group gap={5}>
                {t`Code`}

                <Tooltip
                  label={t`The Workspace code is unique and used to quickly identify the Workspace and data related to the Workspace`}
                >
                  <IconInfoCircle size={16} strokeWidth={1.5} />
                </Tooltip>
              </Group>
            }
            placeholder="GDEN"
            styles={{
              label: {
                fontSize: 11,
              },
              description: {
                fontSize: em(12),
              },
            }}
            {...form.getInputProps("code")}
            value={form.values.code.toUpperCase()}
            onChange={(e) =>
              form.setFieldValue(
                "code",
                String.toSlug(e.currentTarget.value).split("-")[0].toUpperCase()
              )
            }
          />
        </Group>

        <InputWrapper
          label={t`Workspace type`}
          description={t`For each type of Workspace, Joy One will arrange the interface and features to fit. But you can customize them in Settings Menu`}
          {...form.getInputProps("type")}
        >
          <Group pt={10} className="unselectable">
            {Object.values(WorkspaceType).map((type) => {
              return (
                <WorkspaceTypeItem
                  key={type}
                  icon={workspaceTypes[type].icon}
                  label={workspaceTypes[type].name()}
                  isActive={form.values.type === type}
                  onClick={() => form.setFieldValue("type", type)}
                />
              );
            })}
          </Group>
        </InputWrapper>
      </Stack>

      <Stack align="center" mt={16}>
        <Button onClick={onSubmit} loading={isSubmitting} action leftIcon={IconCheck} radius={100}>
          <Trans>Complete</Trans>
        </Button>

        <Anchor onClick={props.onDone} fz={11} fw={700} c="gray">
          <Trans>Exit</Trans>
        </Anchor>
      </Stack>
    </Stack>
  );
};
