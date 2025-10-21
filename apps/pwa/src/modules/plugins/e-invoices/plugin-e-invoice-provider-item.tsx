import { Button } from "@/components/buttons/button";
import { CopyText } from "@/components/copy-text";
import { Image } from "@/components/image";
import { SessionTitle } from "@/components/session-title";
import { api } from "@/modules/apis";
import { useQuery } from "@/modules/apis/use-query";
import { t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { onError } from "@/utils/exceptions.utils";
import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconArchive, IconEdit, IconRefresh } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
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
  }, 1000);

  const archive = async () => {
    await api.delete(`/plugins/e-invoices/providers/${provider._id}`);
    await onRefetch();
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
                leftIcon={IconRefresh}
                onClick={async () => {
                  await api.post(`/plugins/e-invoices/providers/${provider._id}/healthcheck`);
                  await onRefetch();
                }}
              >
                {t("healthcheck")}
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

              <Button
                variant="outline"
                color="gray"
                size="xs"
                leftIcon={IconArchive}
                onClick={archive}
              >
                {t("archive")}
              </Button>
            </Group>
          </Stack>
        </Group>
      </Card>

      <Group align="start" wrap="nowrap">
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
                <Card>
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

        <Stack gap={5}>
          <SessionTitle name={t("variable_list")} />
          <Card>
            <Stack>
              {Object.entries(variables ?? {}).map(([key]) => (
                <Stack key={key} gap={5}>
                  <CopyText fw={600} text={key} />
                  <Text fz={14} c="gray">
                    {t(`e_invoice_variable_${key}`)}
                  </Text>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Stack>
      </Group>
    </Stack>
  );
};
