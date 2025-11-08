"use client";

import { ButtonArchive } from "@/components/buttons/button-archive";
import { Form } from "@/components/form";
import { FormSession } from "@/components/form-session";
import { ModalTitle } from "@/components/modal-title";
import { WorkspaceApiAppDto } from "@/modules/workspace-api-apps/workspace-api-apps-dtos";
import { IWorkspaceApiApp } from "@/modules/workspace-api-apps/workspace-api-apps-entity";
import {
  archiveWorkspaceApiApp,
  createWorkspaceApiApp,
  resetWorkspaceApiAppSecretKey,
  updateWorkspaceApiApp,
} from "@/modules/workspace-api-apps/workspace-api-apps-service";
import { WorkspaceBranchesInput } from "@/modules/workspace-branches/workspace-branches-input";
import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { WorkspaceRolesInput } from "@/modules/workspace-roles/components/workspace-roles-input";
import {
  WorkspacePermission,
  WorkspaceRoleEntity,
  WorkspaceSpecialRoleId,
} from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad } from "@/utils/actions";
import { onFormError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
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
import { workspaceSpecialRoleIds } from "../workspace-roles/workspace-roles-constants";

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
        {
          _id: WorkspaceSpecialRoleId.ADMIN,
          name: workspaceSpecialRoleIds[WorkspaceSpecialRoleId.ADMIN].name(),
        },
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
      name: (value) => (value?.trim() ? null : t`Should not be empty`),
    },
  });

  const roles = workspace.roles.filter((v) => form.values.roles.some((v2) => v2._id === v._id));
  const isMainWorkspaceAccessable = roles.some((v) =>
    v.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS)
  );

  const onResetKey = () => {
    if (!app?._id) return;

    onActionLoad({
      name: <Trans>Reset secret key</Trans>,
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
        const entity = `API App`;
        const _app = await createWorkspaceApiApp(payload);
        form.setInitialValues(getInitialValues(_app));
        form.reset();
        setSecretKey(_app.secretKey);
        modals.updateModal({
          modalId: "ModalWorkspaceApiApp",
          title: <ModalTitle title={t`Update ${entity}`} icon={IconApiApp} />,
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

            <FormSession
              title={<Trans>Secret key</Trans>}
              description={
                <Trans>
                  Please do not provide the secret key to anyone, please reset the secret key if you
                  suspect the secret key has been compromised
                </Trans>
              }
            >
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
                        <Tooltip label={<Trans>Reset secret key</Trans>}>
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

        <FormSession title={<Trans>Name</Trans>}>
          <TextInput {...form.getInputProps("name")} />
        </FormSession>

        <FormSession title={<Trans>Roles</Trans>}>
          <WorkspaceRolesInput
            value={form.values.roles}
            onChange={(roles) => form.setFieldValue("roles", roles)}
          />
        </FormSession>

        <FormSession title={<Trans>Branches</Trans>}>
          {isMainWorkspaceAccessable ? (
            <Badge variant="light">
              <Trans>All branches</Trans>
            </Badge>
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
              {app ? <Trans>Save changes</Trans> : <Trans>Create new</Trans>}
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
  const entity = `API App`;

  return modals.open({
    modalId: "ModalWorkspaceApiApp",
    title: (
      <ModalTitle
        title={app ? <Trans>Update {entity}</Trans> : <Trans>Create new {entity}</Trans>}
        icon={IconApiApp}
      />
    ),
    children: <ModalWorkspaceApiApp app={app} />,
    size: "xl",
  });
};
