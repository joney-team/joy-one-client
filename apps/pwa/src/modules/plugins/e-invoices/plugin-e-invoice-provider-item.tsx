"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { SectionTitle } from "@/components/session-title";
import { WorkspaceType } from "@/graphql/enums.graphql";
import { type ModalConfirmRef } from "@/modals/modal-confirm";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { nonLoading } from "@/utils/non-loading";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Card, Group, InputWrapper, Select, Stack, Text, Tooltip } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconArchive,
  IconEdit,
  IconFileInvoice,
  IconRefresh,
  IconTemplate,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useEffect, useRef, useState } from "react";
import { OnModalCheckEInvoice } from "./components/modal-check-e-invoice";
import { OnModalEInvoiceProvider } from "./components/modal-e-invoice-provider";
import ArchiveEInvoiceProviderDocument from "./graphql/archiveEInvoiceProvider.graphql";
import { PluginEInvoiceProviderFragment } from "./graphql/fragmentPluginEInvoiceProvider.graphql";
import GetEInvoiceTemplateVariablesDocument from "./graphql/getEInvoiceTemplateVariables.graphql";
import HealthcheckEInvoicesProviderDocument from "./graphql/healthcheckEInvoicesProvider.graphql";
import ResetEInvoicesProviderTemplatesDocument from "./graphql/resetEInvoicesProviderTemplates.graphql";
import UpdateEInvoiceProviderDocument from "./graphql/updateEInvoiceProvider.graphql";
import { PluginEInvoiceTemplateEditor } from "./plugin-e-invoice-template-editor";
import {
  eInvoicesProviderStatuses,
  eInvoicesTemplateAutoCreateModes,
  eInvoicesTemplateCreateCriteria,
} from "./plugin-e-invoices-constants";
import {
  PluginEInvoiceTemplateAutoCreateMode,
  PluginEInvoiceTemplateCreateCriteria,
  PluginEInvoiceTemplateType,
  PluginEInvoiceTemplateVariables,
} from "./plugin-e-invoices.types";

const ModalConfirm = dynamic(
  () => import("@/modals/modal-confirm").then((mod) => mod.ModalConfirm),
  {
    ssr: false,
    loading: nonLoading,
  },
);

interface PluginEInvoiceProviderItemProps {
  provider: PluginEInvoiceProviderFragment;
  onRefetch: () => Promise<unknown>;
}

export const PluginEInvoiceProviderItem: FC<PluginEInvoiceProviderItemProps> = ({
  provider,
  onRefetch,
}) => {
  const workspace = useWorkspace();
  const client = useApolloClient();
  const { t } = useLingui();

  const status = eInvoicesProviderStatuses[provider.status];
  const [templates, setTemplates] = useState(provider.templates);

  const modalConfirmRef = useRef<ModalConfirmRef>(null);

  const { data: variablesResult } = useQuery(GetEInvoiceTemplateVariablesDocument);
  const variables =
    variablesResult?.getEInvoiceTemplateVariables as PluginEInvoiceTemplateVariables;

  const syncTemplates = useDebouncedCallback(() => {
    if (JSON.stringify(templates) !== JSON.stringify(provider.templates)) {
      client
        .mutate({
          mutation: UpdateEInvoiceProviderDocument,
          variables: {
            providerId: provider._id,
            input: {
              templates,
            },
          },
        })
        .catch(onError);
    }
  }, 2000);

  const archive = async () => {
    await client.mutate({
      mutation: ArchiveEInvoiceProviderDocument,
      variables: {
        providerId: provider._id,
      },
    });
    await onRefetch();
  };

  const resetTemplates = async () => {
    modalConfirmRef.current?.open({
      icon: IconTemplate,
      content: <Trans>Are you sure you want to reset the templates?</Trans>,
      onConfirm: async () => {
        await client.mutate({
          mutation: ResetEInvoicesProviderTemplatesDocument,
          variables: {
            providerId: provider._id,
          },
        });
        await onRefetch();
      },
      confirmLabel: <Trans>Reset</Trans>,
    });
  };

  useEffect(() => {
    syncTemplates();
  }, [templates]);

  return (
    <Stack>
      <Card>
        <Group gap={20} align="start">
          <Image src={provider.logo} w={120} h={40} />
          <Stack gap={5} flex={1}>
            <Group align="center">
              <Text fw={600} fz={20}>
                {provider.name}
              </Text>

              <Badge color={status.color} variant="light">
                {t(status.name)}
              </Badge>
            </Group>

            <Group gap={8}>
              <Button
                variant="outline"
                color="gray"
                size="xs"
                leftIcon={IconEdit}
                onClick={() => {
                  OnModalEInvoiceProvider({
                    onDone: () => onRefetch(),
                    provider,
                    mode: "update_provider",
                  });
                }}
              >
                <Trans>Change provider</Trans>
              </Button>

              <Button
                variant="outline"
                color="gray"
                size="xs"
                leftIcon={IconEdit}
                onClick={() => {
                  OnModalEInvoiceProvider({
                    onDone: () => onRefetch(),
                    provider,
                    mode: "update_auth",
                  });
                }}
              >
                <Trans>Change auth</Trans>
              </Button>

              <Tooltip label={<Trans>Healthcheck</Trans>}>
                <ActionIcon
                  variant="light"
                  color="gray"
                  size={30}
                  onClick={async () =>
                    onActionLoad({
                      name: <Trans>Healthcheck</Trans>,
                      icon: IconRefresh,
                      process: async () => {
                        await client.mutate({
                          mutation: HealthcheckEInvoicesProviderDocument,
                          variables: { providerId: provider._id },
                        });
                        await onRefetch();
                      },
                    })
                  }
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={<Trans>Reset templates</Trans>}>
                <ActionIcon variant="light" color="gray" size={30} onClick={resetTemplates}>
                  <IconTemplate size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={<Trans>Check invoice</Trans>}>
                <ActionIcon
                  variant="light"
                  color="gray"
                  size={30}
                  onClick={() => OnModalCheckEInvoice()}
                >
                  <IconFileInvoice size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={<Trans>Archive</Trans>}>
                <ActionIcon variant="light" color="gray" size={30} onClick={archive}>
                  <IconArchive size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Stack>
        </Group>
      </Card>

      <Stack flex={1}>
        {Object.values(PluginEInvoiceTemplateType).map((type) => {
          if (
            (type === PluginEInvoiceTemplateType.LOAN_INCOME_RECEIPT &&
              workspace.type !== WorkspaceType.Credit) ||
            !variables
          )
            return null;

          return (
            <Stack key={type} gap={5}>
              <SectionTitle name={<Trans>Template E-Invoice</Trans>} />
              <Card style={{ overflow: "visible" }}>
                <Stack>
                  <Group>
                    <Select
                      flex={1}
                      label={<Trans>Auto create mode</Trans>}
                      data={Object.entries(eInvoicesTemplateAutoCreateModes).map(
                        ([key, value]) => ({
                          label: t(value.name),
                          value: key,
                        }),
                      )}
                      value={templates[type]?.autoCreateMode}
                      onChange={(value) => {
                        setTemplates({
                          ...templates,
                          [type]: {
                            ...templates[type],
                            autoCreateMode: value as PluginEInvoiceTemplateAutoCreateMode,
                          },
                        });
                      }}
                    />

                    <Select
                      flex={1}
                      label={<Trans>Create E-Invoice criteria</Trans>}
                      data={Object.entries(eInvoicesTemplateCreateCriteria).map(([key, value]) => ({
                        label: t(value.name),
                        value: key,
                      }))}
                      value={templates[type]?.createCriteria}
                      onChange={(value) => {
                        setTemplates({
                          ...templates,
                          [type]: {
                            ...templates[type],
                            createCriteria: value as PluginEInvoiceTemplateCreateCriteria,
                          },
                        });
                      }}
                    />
                  </Group>

                  <InputWrapper label={<Trans>Fields</Trans>}>
                    <PluginEInvoiceTemplateEditor
                      type={type}
                      template={templates[type]}
                      variables={variables}
                      onChange={(template) => {
                        setTemplates({
                          ...templates,
                          [type]: {
                            ...templates[type],
                            ...template,
                          },
                        });
                      }}
                    />
                  </InputWrapper>
                </Stack>
              </Card>
            </Stack>
          );
        })}
      </Stack>

      <ModalConfirm ref={modalConfirmRef} />
    </Stack>
  );
};
