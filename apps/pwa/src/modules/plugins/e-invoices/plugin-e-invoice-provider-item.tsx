"use client";

import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { SessionTitle } from "@/components/session-title";
import { api } from "@/modules/apis";
import { useQuery } from "@/modules/apis/use-query";
import { t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { onActionLoad } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { ActionIcon, Badge, Card, Group, Stack, Text, Tooltip } from "@mantine/core";
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
import { eInvoicesProviderStatuses } from "./plugin-e-invoices.config";
import { PluginEInvoicesProviderEntity } from "./plugin-e-invoices.entities";
import {
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
                {t("change_provider")}
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
                {t("change_auth")}
              </Button>

              <Tooltip label={t("healthcheck")}>
                <ActionIcon
                  variant="light"
                  color="gray"
                  size={30}
                  onClick={async () =>
                    onActionLoad({
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

              <Tooltip label={t("reset_templates")}>
                <ActionIcon variant="light" color="gray" size={30} onClick={resetTemplates}>
                  <IconTemplate size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={t("check_invoice")}>
                <ActionIcon
                  variant="light"
                  color="gray"
                  size={30}
                  onClick={() => OnModalCheckEInvoice()}
                >
                  <IconFileInvoice size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={t("archive")}>
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
              <SessionTitle
                name={t("template_entity", { entity: t(`e_invoice_template_type_${type}`) })}
              />
              <Card style={{ overflow: "visible" }}>
                <PluginEInvoiceTemplateEditor
                  type={type}
                  template={templates[type]}
                  variables={variables}
                  onChange={(template) => {
                    setTemplates({ ...templates, [type]: template });
                  }}
                />
              </Card>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};
