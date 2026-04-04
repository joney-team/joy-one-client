"use client";

import { ButtonArchive } from "@/components/buttons/button-archive";
import { Form } from "@/components/form";
import { FormSession } from "@/components/form-session";
import { ModalHead } from "@/components/modal/modal-head";
import { WorkspaceApiAppInput } from "@/graphql/types.graphql";
import { WorkspaceBranchesInput } from "@/modules/workspace-branches/workspace-branches-input";
import { WorkspaceRolesInput } from "@/modules/workspace-roles/components/workspace-roles-input";
import {
  WorkspaceDefaultRoleId,
  WorkspacePermission,
} from "@/modules/workspace-roles/workspace-roles-types";
import { onActionLoad } from "@/utils/actions";
import { onFormError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
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
import { WorkspaceBranchFragment } from "../workspace-branches/graphql/fragmentWorkspaceBranch.graphql";
import { WorkspaceRoleFragment } from "../workspace-roles/graphql/fragmentWorkspaceRole.graphql";
import { useWorkspaceRoles } from "../workspace-roles/hooks/use-workspace-roles";
import { workspaceDefaultRoles } from "../workspace-roles/workspace-roles-constants";
import ArchiveWorkspaceApiAppDocument from "./graphql/archiveWorkspaceApiApp.graphql";
import CreateWorkspaceApiAppDocument from "./graphql/createWorkspaceApiApp.graphql";
import { WorkspaceApiAppFragment } from "./graphql/fragmentWorkspaceApiApp.graphql";
import RegenerateWorkspaceApiAppSecretDocument from "./graphql/regenerateWorkspaceApiAppSecret.graphql";
import UpdateWorkspaceApiAppDocument from "./graphql/updateWorkspaceApiApp.graphql";

interface ModalWorkspaceApiAppProps {
  app?: WorkspaceApiAppFragment;
}

const ModalWorkspaceApiApp: FC<ModalWorkspaceApiAppProps> = (props) => {
  const { t } = useLingui();
  const client = useApolloClient();

  const secretKeyVisible = useDisclosure(false);
  const [app, setApp] = useState<WorkspaceApiAppFragment | null>(props.app || null);
  const [secretKey, setSecretKey] = useState(app?.secretKey || "");

  const getInitialValues = (_app?: WorkspaceApiAppFragment) => {
    return {
      name: _app?.member.name || "",
      roles: _app?.member.roles || [
        {
          _id: WorkspaceDefaultRoleId.ADMIN,
          name: t(workspaceDefaultRoles[WorkspaceDefaultRoleId.ADMIN].name),
          color: null,
        },
      ],
      workspaceBranches: _app?.member.workspaceBranches || [],
    };
  };

  const form = useForm<{
    name: string;
    roles: Pick<WorkspaceRoleFragment, "_id" | "name" | "color">[];
    workspaceBranches: Pick<WorkspaceBranchFragment, "_id" | "name" | "hotline">[];
  }>({
    initialValues: getInitialValues(props.app),
    validate: {
      name: (value) => (value?.trim() ? null : t`Should not be empty`),
    },
  });

  const { workspaceRoles } = useWorkspaceRoles();
  const roles = workspaceRoles.filter((v) => form.values.roles.some((v2) => v2._id === v._id));
  const isMainWorkspaceAccessable = roles.some((v) =>
    v.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS),
  );

  const onResetKey = () => {
    if (!app?._id) return;

    onActionLoad({
      name: <Trans>Reset secret key</Trans>,
      process: () =>
        client.mutate({
          mutation: RegenerateWorkspaceApiAppSecretDocument,
          variables: {
            appId: app._id,
          },
        }),
      onFinished: (result) => {
        setSecretKey(result.data?.apiApp.secretKey!);
      },
    });
  };

  const onSubmit = form.onSubmit(async (data) => {
    try {
      const input: WorkspaceApiAppInput = {
        name: data.name,
        enabled: app ? app.enabled : true,
        roleIds: data.roles.map((v) => v._id),
        workspaceBranchIds: data.workspaceBranches.map((v) => v._id),
      };

      if (app) {
        const result = await client.mutate({
          mutation: UpdateWorkspaceApiAppDocument,
          variables: {
            appId: app._id,
            input,
          },
        });
        if (!result.data?.apiApp) throw new Error(t`Action failed`);
        form.setInitialValues(getInitialValues(result.data?.apiApp));
        form.reset();
        setApp(result.data?.apiApp);
      } else {
        const entity = `API App`;
        const result = await client.mutate({
          mutation: CreateWorkspaceApiAppDocument,
          variables: {
            input,
          },
        });
        if (!result.data?.apiApp) throw new Error(t`Action failed`);
        form.setInitialValues(getInitialValues(result.data?.apiApp));
        form.reset();
        setSecretKey(result.data?.apiApp.secretKey);
        modals.updateModal({
          modalId: "ModalWorkspaceApiApp",
          title: <ModalHead name={t`Update ${entity}`} icon={IconApiApp} />,
        });
        setApp(result.data?.apiApp);
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

        <Stack gap="md" mt={16}>
          <Center>
            <Button loading={form.submitting} type="submit" disabled={!form.isDirty()}>
              {app ? <Trans>Save changes</Trans> : <Trans>Create new</Trans>}
            </Button>
          </Center>

          {!!app && (
            <ButtonArchive
              process={() =>
                client.mutate({
                  mutation: ArchiveWorkspaceApiAppDocument,
                  variables: {
                    appId: app._id,
                  },
                })
              }
              goBackWhenArchived={false}
              onArchived={() => modals.close("ModalWorkspaceApiApp")}
            />
          )}
        </Stack>
      </Stack>
    </Form>
  );
};

export const OnModalWorkspaceApiApp = (app?: WorkspaceApiAppFragment) => {
  const entity = `API App`;

  return modals.open({
    modalId: "ModalWorkspaceApiApp",
    title: (
      <ModalHead
        name={app ? <Trans>Update {entity}</Trans> : <Trans>Create new {entity}</Trans>}
        icon={IconApiApp}
      />
    ),
    children: <ModalWorkspaceApiApp app={app} />,
    size: "xl",
  });
};
