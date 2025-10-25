"use client";

import { Button } from "@/components/buttons/button";
import { OnModalZaloOaSendZns } from "@/modules/plugins/zalo-oas/modals/modal-zalo-oa-send-zns";
import { updatePluginZalo } from "@/modules/plugins/zalo-oas/zalo-oas-service";
import {
  PluginZaloOaEntity,
  PluginZaloOaZNSTemplateId,
  ZnsTemplateConfig,
} from "@/modules/plugins/zalo-oas/zalo-oas-types";
import { t } from "@lingui/core/macro";
import { Card, em, Group, Stack, Switch, Table, Text, TextInput, ThemeIcon } from "@mantine/core";
import { IconTemplate } from "@tabler/icons-react";
import { FC, useState } from "react";
import { pluginZaloOaZNSTemplateIds } from "../zalo-oas-constants";

export const ZaloOaZnsTemplateConfig: FC<{
  templateId: PluginZaloOaZNSTemplateId;
  config: ZnsTemplateConfig;
  oa: PluginZaloOaEntity;
}> = (props) => {
  const { oa } = props;

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
              {pluginZaloOaZNSTemplateIds[props.templateId].name()}
            </Text>
          </Group>

          <Switch
            checked={isActive}
            onChange={(e) => {
              setIsActive(e.target.checked);
              updatePluginZalo(oa._id, {
                ...oa,
                znsTemplateStatues: {
                  ...oa.znsTemplateStatues,
                  [props.templateId]: e.target.checked,
                },
              });
            }}
          />
        </Group>

        <Stack gap={5}>
          <Text fz={em(13)} fw={500}>
            {t`Params`}
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
                          {t`Example`}: {item.default}
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
              updatePluginZalo(oa._id, {
                ...oa,
                znsTemplateIds: {
                  ...oa.znsTemplateIds,
                  [props.templateId]: e.target.value,
                },
              })
            }
          />

          <Button
            onClick={() => OnModalZaloOaSendZns(props)}
            disabled={!oa.znsTemplateIds?.[props.templateId] || !isActive}
          >
            {t`Send ZNS`}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
