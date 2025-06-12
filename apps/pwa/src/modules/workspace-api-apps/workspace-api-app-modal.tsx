"use client";

import { ButtonArchive } from "@/components/buttons/button-archive";
import { Form } from "@/components/form";
import { FormSession } from "@/components/form-session";
import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceApiAppDto } from "@/modules/workspace-api-apps/workspace-api-apps-dtos";
import { IWorkspaceApiApp } from "@/modules/workspace-api-apps/workspace-api-apps-entity";
import {
  archiveWorkspaceApiApp,
  createWorkspaceApiApp,
  resetWorkspaceApiAppSecretKey,
  updateWorkspaceApiApp,
} from "@/modules/workspace-api-apps/workspace-api-apps-service";
import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { WorkspaceBranchesInput } from "@/modules/workspace-branches/workspace-branches-input";
import {
  WorkspacePermission,
  WorkspaceRoleEntity,
  WorkspaceSpecialRoleId,
} from "@/modules/workspace-roles/workspace-roles-types";
import { WorkspaceRolesInput } from "@/modules/workspace-roles/workspace-roles-input";
import { onActionLoad } from "@/utils/actions";
import { onFormError } from "@/utils/exceptions.utils";
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  CopyButton,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconApiApp,
  IconCheck,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconRefresh,
} from "@tabler/icons-react";
import { FC, Fragment, useState } from "react";

interface ModalWorkspaceApiAppProps {
  app?: IWorkspaceApiApp;
}

const ModalWorkspaceApiApp: FC<ModalWorkspaceApiAppProps> = (props) => {
  const workspace = useWorkspace();

  const secretKeyVisible = useDisclosure(false);
  const [app, setApp] = useState<IWorkspaceApiApp | null>(props.app || null);
  const [secretKey, setSecretKey] = useState(app?.secretKey || "");

  const getInitialValues = (_app?: IWorkspaceApiApp) => {
    return {
      name: _app?.member.name || "",
      roles: _app?.member.roles || [
        { _id: WorkspaceSpecialRoleId.ADMIN, name: t(`role_${WorkspaceSpecialRoleId.ADMIN}`) },
      ],
      workspaceBranches: _app?.member.workspaceBranches || [],
    };
  };

  const form = useForm<{
    name: string;
    roles: Pick<WorkspaceRoleEntity, "_id" | "name" | "color">[];
    workspaceBranches: Pick<WorkspaceBranchEntity, "_id" | "name">[];
  }>({
    initialValues: getInitialValues(props.app),
    validate: {
      name: (value) => (value?.trim() ? null : t("should not be empty")),
    },
  });

  const roles = workspace.roles.filter((v) => form.values.roles.some((v2) => v2._id === v._id));
  const isMainWorkspaceAccessable = roles.some((v) =>
    v.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS)
  );

  const onResetKey = () => {
    if (!app?._id) return;

    onActionLoad({
      process: () => resetWorkspaceApiAppSecretKey(app._id),
      onFinished: (result) => {
        setSecretKey(result.secretKey);
      },
    });
  };

  const onSubmit = form.onSubmit(async (data) => {
    try {
      const payload: WorkspaceApiAppDto = {
        name: data.name,
        enabled: app ? app.enabled : true,
        roleIds: data.roles.map((v) => v._id),
        workspaceBranchIds: data.workspaceBranches.map((v) => v._id),
      };

      if (app) {
        const _app = await updateWorkspaceApiApp(app._id, payload);
        form.setInitialValues(getInitialValues(_app));
        form.reset();
        setApp(_app);
      } else {
        const _app = await createWorkspaceApiApp(payload);
        form.setInitialValues(getInitialValues(_app));
        form.reset();
        setSecretKey(_app.secretKey);
        modals.updateModal({
          modalId: "ModalWorkspaceApiApp",
          title: (
            <ModalTitle title={`${t("info_entity", { entity: t("app") })}`} icon={IconApiApp} />
          ),
        });
        setApp(_app);
      }
    } catch (error) {
      onFormError(form, error);
    }
  });

  return (
    <Form onSubmit={onSubmit}>
      <Stack gap={30} pt={16}>
        {!!app && (
          <Fragment>
            <FormSession title="ID">
              <CopyButton value={app._id}>
                {({ copied, copy }) => (
                  <TextInput
                    value={app._id}
                    readOnly
                    rightSection={
                      <ActionIcon onClick={copy} variant="subtle">
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    }
                  />
                )}
              </CopyButton>
            </FormSession>

            <FormSession title="secret_key" description="secret_key_desc">
              <CopyButton value={secretKey}>
                {({ copied, copy }) => (
                  <PasswordInput
                    value={secretKey}
                    readOnly
                    visible={secretKeyVisible[0]}
                    styles={{
                      innerInput: {
                        paddingRight: 100,
                      },
                      section: {
                        width: 100,
                      },
                    }}
                    rightSection={
                      <Group wrap="nowrap" gap={0}>
                        <Tooltip label={t("reset_secret_key")}>
                          <ActionIcon onClick={onResetKey} variant="subtle">
                            <IconRefresh size={16} />
                          </ActionIcon>
                        </Tooltip>

                        <ActionIcon onClick={secretKeyVisible[1].toggle} variant="subtle">
                          {secretKeyVisible[0] ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </ActionIcon>

                        <ActionIcon onClick={copy} variant="subtle">
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Group>
                    }
                  />
                )}
              </CopyButton>
            </FormSession>
          </Fragment>
        )}

        <FormSession title="name">
          <TextInput {...form.getInputProps("name")} />
        </FormSession>

        <FormSession title="roles">
          <WorkspaceRolesInput
            value={form.values.roles}
            onChange={(roles) => form.setFieldValue("roles", roles)}
          />
        </FormSession>

        <FormSession title="branches">
          {isMainWorkspaceAccessable ? (
            <Badge variant="light">{t("all_branches")}</Badge>
          ) : (
            <WorkspaceBranchesInput
              key={app?.member.userId}
              value={form.values.workspaceBranches}
              onChange={(branches) => {
                form.setFieldValue("workspaceBranches", branches);
              }}
            />
          )}
        </FormSession>

        <Stack gap={16} mt={16}>
          <Center>
            <Button loading={form.submitting} type="submit" disabled={!form.isDirty()}>
              {t(app ? "save_changes" : "create_new")}
            </Button>
          </Center>

          {!!app && (
            <ButtonArchive
              process={() => archiveWorkspaceApiApp(app._id)}
              goBackWhenArchived={false}
              onArchived={() => {
                modals.close("ModalWorkspaceApiApp");
              }}
            />
          )}
        </Stack>
      </Stack>
    </Form>
  );
};

export const OnModalWorkspaceApiApp = (app?: IWorkspaceApiApp) => {
  return modals.open({
    modalId: "ModalWorkspaceApiApp",
    title: (
      <ModalTitle
        title={`${t(app ? "info_entity" : "create_new", { entity: t("app") })}`}
        icon={IconApiApp}
      />
    ),
    children: <ModalWorkspaceApiApp app={app} />,
    size: "xl",
  });
};
