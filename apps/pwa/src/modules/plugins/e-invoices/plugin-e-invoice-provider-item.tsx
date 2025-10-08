import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { SessionTitle } from "@/components/session-title";
import { api } from "@/modules/apis";
import { t } from "@/modules/lang/lang-service";
import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { IconEdit, IconRefresh } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { OnModalEInvoiceProvider } from "./modal-e-invoice-provider";
import { PluginEInvoiceTemplateEditor } from "./plugin-e-invoice-template-editor";
import {
  eInvoicesProviders,
  eInvoicesProviderStatuses,
  eInvoicesTemplateTypes,
} from "./plugin-e-invoices.config";
import { PluginEInvoicesProviderEntity } from "./plugin-e-invoices.entities";
import { PluginEInvoiceTemplateType } from "./plugin-e-invoices.types";
import { useDebouncedCallback } from "@mantine/hooks";
import { onError } from "@/utils/exceptions.utils";

interface PluginEInvoiceProviderItemProps {
  provider: PluginEInvoicesProviderEntity;
  onRefetch: () => Promise<unknown>;
}

export const PluginEInvoiceProviderItem: FC<PluginEInvoiceProviderItemProps> = ({
  provider,
  onRefetch,
}) => {
  const providerConfig = eInvoicesProviders[provider.provider];
  const status = eInvoicesProviderStatuses[provider.status];
  const [templates, setTemplates] = useState(provider.templates);

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

  useEffect(() => {
    syncTemplates();
  }, [templates]);

  return (
    <Stack>
      <Card>
        <Group gap={20} align="start">
          <Image src={providerConfig.logo} w={120} h={40} />
          <Stack gap={5} flex={1}>
            <Group align="center">
              <Text fw={600} fz={20}>
                {providerConfig.name}
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
                  OnModalEInvoiceProvider({ onDone: () => onRefetch(), provider });
                }}
              >
                {t("edit")}
              </Button>
            </Group>
          </Stack>
        </Group>
      </Card>

      {Object.values(PluginEInvoiceTemplateType).map((type) => (
        <Stack key={type} gap={5}>
          <SessionTitle name={t("template_entity", { entity: t(eInvoicesTemplateTypes[type]) })} />
          <Card>
            <PluginEInvoiceTemplateEditor
              type={type}
              template={templates[type]}
              onChange={(template) => {
                setTemplates({ ...templates, [type]: template });
              }}
            />
          </Card>
        </Stack>
      ))}
    </Stack>
  );
};
