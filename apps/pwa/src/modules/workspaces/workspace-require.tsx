"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { uploadFile } from "@/modules/files/file-service";
import { useLang } from "@/modules/lang/lang-context";
import { t } from "@/modules/lang/lang-service";
import { renderLocation } from "@/modules/locations/locations-service";
import { LocationEntity } from "@/modules/locations/locations-types";
import { WorkspaceTypeItem } from "@/modules/workspaces/components/workpsace-type-item";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getWorkspaceTypeIcon } from "@/modules/workspaces/workspaces-service";
import { WorkspaceContext, WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { onError } from "@/utils/exceptions.utils";
import { StringUtils } from "@/utils/string.utils";
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
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconCheck,
  IconInfoCircle,
  IconLocation,
  IconPlus,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { ChangeEventHandler, FC, useEffect, useState } from "react";
import { useApp } from "../../app.context";
import { api } from "../apis";
import { getUserMemberRoleLabel } from "../workspace-members/workspace-members-service";

export const WorkspaceRequire: FC<{ workspace: WorkspaceContext }> = (props) => {
  const { workspace } = props;
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
              {t("preparing_workspace_msg")}
            </Text>
          ) : (
            <Text ta="center" fz={em(15)} fw={500}>
              {t("guest_user_msg", { workspace: app.metadata.appName || "Workspace" })}
            </Text>
          )}

          <Button mt={5} variant="transparent" color="gray" onClick={() => auth.signOut()} fz={11}>
            {t("use_another_account")}
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
            {t("new_workspace")}
          </Title>

          <Button
            onClick={() => workspace.setIsCreateNew(true)}
            leftIcon={IconPlus}
            type="submit"
            radius={100}
            size="lg"
          >
            {t("start_now")}
          </Button>

          <Divider label={t("or")} w="80%" />

          <Text ta="center">{t("join_workspace", { email: auth.user?.email })}</Text>

          <Center>
            <Anchor onClick={() => auth.signOut()} fz={11} fw={700} c="gray">
              {t("logout")}
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
            {t("select")} Workspace
          </Title>
          <Text ta="center" fz="xs" c="gray">
            {t("company")} / {t("company_branch")}
          </Text>

          <Stack mt={30}>
            {availabelUserMembers.length === 0 && <Text>{t("not_have_workspace_msg")}</Text>}

            {availabelUserMembers.map((userMember) => {
              if (!userMember.workspaceId) return null;

              const location = renderLocation(userMember.workspace.location);

              return (
                <Card
                  withBorder
                  shadow="none"
                  p={12}
                  maw="80dvw"
                  w={350}
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
                        <Text fz="xs">{getUserMemberRoleLabel(userMember)}</Text>
                      </Group>

                      {!!location && (
                        <Group wrap="nowrap" gap={3} align="start">
                          <ThemeIcon size="xs" variant="transparent" color="dark">
                            <IconLocation strokeWidth={1.2} />
                          </ThemeIcon>
                          <Text fz="xs">{location}</Text>
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
                {t("create_new_workspace")}
              </Button>
            </Center>

            <Anchor ta="center" onClick={() => auth.signOut()} fz={11} fw={700} c="gray">
              {t("logout")}
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [logo, setLogo] = useState<File | null>(null);

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
        if (!value) return t("required");
      },
      code: (value: string) => {
        if (!value) return t("required");
        if (!/^[A-Z0-9]+$/.test(value)) return t("invalid_workspace_code");
      },
      type: (value: WorkspaceType) => {
        if (!value) return t("required");
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    let _logo = "";
    if (logo) {
      const file = await uploadFile({ file: logo, maxWidthOrHeight: 300 });
      _logo = file.relativePath;
    }

    await workspace
      .create({ ...values, logo: _logo })
      .then(props.onDone)
      .catch(onError);
    setIsSubmitting(false);
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
          {t("create")} Workspace
        </Title>
        <Text ta="center" fz="xs" c="gray">
          {t("company")} / {t("company_branch")}
        </Text>
      </Stack>

      <Stack>
        <Group align="start">
          <TextInput
            flex={1}
            label={t("name")}
            placeholder="Gold Dental"
            {...form.getInputProps("name")}
            onChange={onChangeName}
          />

          <TextInput
            label={
              <Group gap={5}>
                {t("code")}

                <Tooltip label={t("workspace_code_explain")}>
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
                StringUtils.toSlug(e.currentTarget.value).split("-")[0].toUpperCase()
              )
            }
          />
        </Group>

        <InputWrapper label="Logo">
          <Dropzone
            accept={IMAGE_MIME_TYPE}
            onDrop={(files) => {
              if (!files.length) return;
              setLogo(files[0]);
            }}
            multiple={false}
            style={{ cursor: "pointer" }}
          >
            <Group style={{ position: "relative" }} pt={3} gap={8}>
              <Avatar
                src={logo ? URL.createObjectURL(logo) : form.values.logo}
                size={60}
                radius={10}
              >
                {form.values?.name?.slice(0, 2) || "W"}
              </Avatar>

              <Group gap={3}>
                <ThemeIcon variant="transparent" color="dark" size="md">
                  <IconUpload strokeWidth={1.2} size={18} />
                </ThemeIcon>
                <Text fz={12}>{t("click_to_change")}</Text>
              </Group>
            </Group>
          </Dropzone>
        </InputWrapper>

        <InputWrapper
          label={t("workspace_type")}
          description={t("workspace_type_desc")}
          {...form.getInputProps("type")}
        >
          <Group pt={10} className="unselectable">
            {Object.values(WorkspaceType).map((type) => {
              return (
                <WorkspaceTypeItem
                  key={type}
                  icon={getWorkspaceTypeIcon(type)}
                  label={t(`ws_t_${type}`).toString()}
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
          {t("complete")}
        </Button>

        <Anchor onClick={props.onDone} fz={11} fw={700} c="gray">
          {t("exit")}
        </Anchor>
      </Stack>
    </Stack>
  );
};
