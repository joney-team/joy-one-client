"use client";

import { Button } from "@/components/buttons/button";
import { PluginZaloOaZnsTemplateId } from "@/graphql/types.graphql";
import { OnModalZaloOaSendZns } from "@/modules/plugins/zalo-oas/modals/modal-zalo-oa-send-zns";
import { ZnsTemplateConfig } from "@/modules/plugins/zalo-oas/zalo-oas-types";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Card, em, Group, Stack, Switch, Table, Text, TextInput, ThemeIcon } from "@mantine/core";
import { IconTemplate } from "@tabler/icons-react";
import { FC, useState } from "react";
import { ZaloOaFragment } from "../graphql/fragmentZaloOa.graphql";
import UpdateZaloOaDocument from "../graphql/updateZaloOa.graphql";
import { pluginZaloOaZNSTemplateIds } from "../zalo-oas-constants";

export const ZaloOaZnsTemplateConfig: FC<{
  templateId: PluginZaloOaZnsTemplateId;
  config: ZnsTemplateConfig;
  oa: ZaloOaFragment;
}> = (props) => {
  const { oa } = props;
  const { t } = useLingui();
  const client = useApolloClient();

  const defaultActive =
    typeof oa.znsTemplateStatues?.[props.templateId] === "undefined" ||
    oa.znsTemplateStatues?.[props.templateId] === true;

  const [isActive, setIsActive] = useState(defaultActive);

  return (
    <Card withBorder shadow="none" p={10}>
      <Stack>
        <Group justify="space-between">
          <Group gap={3}>
            <ThemeIcon variant="transparent">
              <IconTemplate size={18} />
            </ThemeIcon>
            <Text fz={em(15)} fw={500}>
              {t(pluginZaloOaZNSTemplateIds[props.templateId].name)}
            </Text>
          </Group>

          <Switch
            checked={isActive}
            onChange={(e) => {
              setIsActive(e.target.checked);
              client.mutate({
                mutation: UpdateZaloOaDocument,
                variables: {
                  updateZaloOaId: oa._id,
                  input: {
                    znsTemplateStatues: {
                      ...oa.znsTemplateStatues,
                      [props.templateId]: e.target.checked,
                    },
                  },
                },
              });
            }}
          />
        </Group>

        <Stack gap={5}>
          <Text fz={em(13)} fw={500}>
            <Trans>Params</Trans>
          </Text>
          <Table withTableBorder>
            <Table.Tbody>
              {props.config.fields.map((item, index) => {
                return (
                  <Table.Tr key={index}>
                    <Table.Td fw={500}>{item.fieldName}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fz={em(15)}>{item.description}</Text>
                        <Text fz={em(11)}>
                          <Trans>Example</Trans>: {item.default}
                        </Text>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Stack>

        <Group align="end" gap={8}>
          <TextInput
            flex={1}
            placeholder={t`Template ID`}
            defaultValue={oa.znsTemplateIds?.[props.templateId]}
            onChange={(e) =>
              client.mutate({
                mutation: UpdateZaloOaDocument,
                variables: {
                  updateZaloOaId: oa._id,
                  input: {
                    znsTemplateStatues: oa.znsTemplateStatues,
                    znsTemplateIds: {
                      ...oa.znsTemplateIds,
                      [props.templateId]: e.target.value,
                    },
                  },
                },
              })
            }
          />

          <Button
            onClick={() => OnModalZaloOaSendZns(props)}
            disabled={!oa.znsTemplateIds?.[props.templateId] || !isActive}
          >
            <Trans>Send ZNS</Trans>
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
