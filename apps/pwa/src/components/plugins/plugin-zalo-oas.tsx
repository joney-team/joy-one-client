"use client";

import { Button } from "@/components/buttons/button";
import { t } from "@/modules/lang/lang-service";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { OnModalZaloOaSendZns } from "@/modules/plugins/zalo-oas/modal-zalo-oa-send-zns";
import {
  connectPluginZalo,
  disconnectPluginZalo,
  reconnectPluginZalo,
  setDefaultPluginZalo,
  updatePluginZalo,
} from "@/modules/plugins/zalo-oas/zalo-oas-service";
import {
  PluginZaloOaEntity,
  PluginZaloOaStatus,
  PluginZaloOaZNSTemplateId,
  ZnsTemplateConfig,
} from "@/modules/plugins/zalo-oas/zalo-oas-types";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad, onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { StringUtils } from "@/utils/string.utils";
import {
  ActionIcon,
  Badge,
  Card,
  Center,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  em,
  TextInput,
} from "@mantine/core";
import {
  IconCirclesRelation,
  IconLinkOff,
  IconLinkPlus,
  IconPuzzle,
  IconRefresh,
  IconStackFront,
  IconTemplate,
} from "@tabler/icons-react";
import { FC, Fragment, useState } from "react";
import { Avatar } from "../avatar";
import { Image } from "../image";

export const PluginZaloOAs: FC = () => {
  const workspace = useWorkspace();
  const plugins = usePlugins();
  const color = useColor();

  if (plugins.zaloOas.length === 0)
    return (
      <Stack align="center" py={20}>
        <Group gap={30} mb={20}>
          <Avatar workspace={workspace.userMember.workspace} size={55} />
          <ThemeIcon variant="transparent" size="lg" color="dark">
            <IconCirclesRelation size={50} />
          </ThemeIcon>
          <Image w={55} src="/images/plugins-zalo-oa.svg" />
        </Group>

        <Title mt={-10} ta="center" order={2} fw={300} c={color("primary")}>
          {t("connect")} <strong>Zalo OAs</strong>
        </Title>

        <Text ta="center">{t("connect_zalo_oa_desc")}</Text>

        <Button mt={10} type="submit" onClick={() => connectPluginZalo()} leftIcon={IconLinkPlus}>
          {t("connect")}
        </Button>
      </Stack>
    );

  const defaultZaloOa = plugins.zaloOas.find((oa) => oa.isDefault);

  return (
    <Stack gap={30}>
      <SimpleGrid cols={{ md: 2 }}>
        {plugins.zaloOas.map((oa) => {
          return (
            <Card key={oa._id} shadow="none" withBorder>
              <Group justify="space-between" align="start">
                <Avatar pluginZaloOa={oa} size={60} />
                <Stack gap={8} flex={1}>
                  <Group justify="space-between">
                    <Text fw={500}>{oa.name}</Text>

                    {oa.status === PluginZaloOaStatus.ACTIVE ? (
                      <Badge size="xs" color="green">
                        {t("active")}
                      </Badge>
                    ) : (
                      <Badge size="xs" color="red">
                        {t("inactive")}
                      </Badge>
                    )}
                  </Group>

                  <Tooltip label={oa.description} multiline withArrow>
                    <Text c="gray" fz={13}>
                      {StringUtils.limitCharacters(oa.description || "", 90)}
                    </Text>
                  </Tooltip>

                  <Group gap={5}>
                    {oa.package_name && (
                      <Badge variant="light" size="xs" color="blue">
                        {t("package")}: {oa.package_name}
                      </Badge>
                    )}
                    {oa.isDefault && (
                      <Badge variant="light" size="xs" color="green">
                        {t("default")}
                      </Badge>
                    )}
                  </Group>

                  <Group gap={8} mt={8}>
                    <Tooltip label={t("set_default")}>
                      <ActionIcon
                        onClick={() =>
                          onActionLoad({
                            icon: IconStackFront,
                            name: `${t("set_default")} ${oa.name}`,
                            process: () => setDefaultPluginZalo(oa._id).catch(onError),
                          })
                        }
                        variant="light"
                        color="green"
                        disabled={oa.isDefault}
                      >
                        <IconStackFront size={16} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label={t("reconnect")}>
                      <ActionIcon
                        onClick={() =>
                          onActionLoad({
                            icon: IconRefresh,
                            name: `${t("reconnect")} ${oa.name}`,
                            process: () => reconnectPluginZalo(oa._id).catch(onError),
                          })
                        }
                        variant="light"
                        color="green"
                      >
                        <IconRefresh size={16} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label={`${t("disconect")} ${oa.name}`}>
                      <ActionIcon
                        onClick={() =>
                          onArchive({
                            icon: IconPuzzle,
                            title: `${t("disconect")} ${oa.name}`,
                            children: t("disconect_confirm"),
                            process: () => disconnectPluginZalo(oa._id).catch(onError),
                          })
                        }
                        variant="light"
                        color="gray"
                      >
                        <IconLinkOff size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Stack>
              </Group>
            </Card>
          );
        })}

        <Center>
          <Button
            type="submit"
            onClick={() => connectPluginZalo()}
            rightSection={<IconLinkPlus strokeWidth={1.5} />}
          >
            {t("connect")}
          </Button>
        </Center>
      </SimpleGrid>

      {defaultZaloOa && (
        <Fragment>
          <Divider mb={-15} label="ZNS | Templates" labelPosition="left" />
          <SimpleGrid cols={{ md: 2 }}>
            {Object.keys(plugins.znsTemplateConfigs).map((key) => {
              const config = (plugins.znsTemplateConfigs as any)[key] as ZnsTemplateConfig;
              const isvalid =
                !config.workspaceTypes || config.workspaceTypes.includes(workspace.type);
              if (!isvalid) return null;

              return (
                <ZNSTemplateConfig
                  key={key}
                  config={config}
                  oa={defaultZaloOa}
                  templateId={key as any}
                />
              );
            })}
          </SimpleGrid>
        </Fragment>
      )}
    </Stack>
  );
};

const ZNSTemplateConfig: FC<{
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
              {t(`zns_${props.templateId}`)}
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
            {t("params")}
          </Text>
          <Table withTableBorder>
            <Table.Tbody>
              {props.config.fields.map((item, index) => {
                return (
                  <Table.Tr key={index}>
                    <Table.Td fw={500}>{item.fieldName}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fz={em(15)}>{t(item.description)}</Text>
                        <Text fz={em(11)}>
                          {t("example")}: {item.default}
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
            placeholder="Template ID"
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
            {t("send_zns")}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};
