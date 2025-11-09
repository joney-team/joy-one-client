"use client";

import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { SectionTitle } from "@/components/session-title";
import { api } from "@/modules/apis";
import { useQuery } from "@/modules/apis/use-query";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { onActionLoad } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  InputWrapper,
  Select,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconArchive,
  IconEdit,
  IconFileInvoice,
  IconRefresh,
  IconTemplate,
} from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { OnModalCheckEInvoice } from "./modal-check-e-invoice";
import { OnModalEInvoiceProvider } from "./modal-e-invoice-provider";
import { PluginEInvoiceTemplateEditor } from "./plugin-e-invoice-template-editor";
import {
  eInvoicesProviderStatuses,
  eInvoicesTemplateAutoCreateModes,
  eInvoicesTemplateCreateCriteria,
} from "./plugin-e-invoices-constants";
import { PluginEInvoicesProviderEntity } from "./plugin-e-invoices.entities";
import {
  PluginEInvoiceTemplateAutoCreateMode,
  PluginEInvoiceTemplateCreateCriteria,
  PluginEInvoiceTemplateType,
  PluginEInvoiceTemplateVariables,
} from "./plugin-e-invoices.types";

interface PluginEInvoiceProviderItemProps {
  provider: PluginEInvoicesProviderEntity;
  onRefetch: () => Promise<unknown>;
}

export const PluginEInvoiceProviderItem: FC<PluginEInvoiceProviderItemProps> = ({
  provider,
  onRefetch,
}) => {
  const workspace = useWorkspace();

  const status = eInvoicesProviderStatuses[provider.status];
  const [templates, setTemplates] = useState(provider.templates);

  const { data: variables } = useQuery<PluginEInvoiceTemplateVariables>({
    route: "/plugins/e-invoices/templates/variables",
    refetchWhenReconnected: true,
  });

  const syncTemplates = useDebouncedCallback(() => {
    if (JSON.stringify(templates) !== JSON.stringify(provider.templates)) {
      api
        .put(`/plugins/e-invoices/providers/${provider._id}`, {
          ...provider,
          templates,
        })
        .catch(onError);
    }
  }, 2000);

  const archive = async () => {
    await api.delete(`/plugins/e-invoices/providers/${provider._id}`);
    await onRefetch();
  };

  const resetTemplates = async () => {
    onActionLoad({
      name: <Trans>Reset templates</Trans>,
      icon: IconTemplate,
      process: async () => {
        await api.post(`/plugins/e-invoices/providers/${provider._id}/reset-templates`);
        await onRefetch();
      },
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
                {status.name()}
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

              <Tooltip label={t`Healthcheck`}>
                <ActionIcon
                  variant="light"
                  color="gray"
                  size={30}
                  onClick={async () =>
                    onActionLoad({
                      name: <Trans>Healthcheck</Trans>,
                      icon: IconRefresh,
                      process: async () => {
                        await api.post(`/plugins/e-invoices/providers/${provider._id}/healthcheck`);
                        await onRefetch();
                      },
                    })
                  }
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={t`Reset templates`}>
                <ActionIcon variant="light" color="gray" size={30} onClick={resetTemplates}>
                  <IconTemplate size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={t`Check invoice`}>
                <ActionIcon
                  variant="light"
                  color="gray"
                  size={30}
                  onClick={() => OnModalCheckEInvoice()}
                >
                  <IconFileInvoice size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={t`Archive`}>
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
              workspace.type !== WorkspaceType.CREDIT) ||
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
                          label: value.name(),
                          value: key,
                        })
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
                        label: value.name(),
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
    </Stack>
  );
};
