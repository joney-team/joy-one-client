"use client";

import { Container } from "@/components/container";
import { t } from "@/modules/lang/lang-service";
import { usePlugins } from "@/modules/plugins/plugins-context";
import {
  disconnectPluginZalo,
  reconnectPluginZalo,
  setDefaultPluginZalo,
} from "@/modules/plugins/zalo-oas/zalo-oas-service";
import { PluginZaloOaStatus, ZnsTemplateConfig } from "@/modules/plugins/zalo-oas/zalo-oas-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad, onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { StringUtils } from "@/utils/string.utils";
import { ActionIcon, Badge, Card, Group, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconLinkOff,
  IconPuzzle,
  IconRefresh,
  IconStackFront,
  IconTemplate,
  IconUsersGroup,
} from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { Avatar } from "../../../components/avatar";
import { SessionTitle } from "../../../components/session-title";
import { ZaloOaZnsTemplateConfig } from "./components/zalo-oa-zns-template-config";
import { ZaloOasOnboarding } from "./components/zalo-oas-onboarding";
import { ZaloOaGmfGroups } from "./components/zalo-oa-gmf-groups";

export const PluginZaloOAs: FC = () => {
  const workspace = useWorkspace();
  const plugins = usePlugins();

  if (plugins.zaloOas.length === 0) return <ZaloOasOnboarding />;

  const defaultZaloOa = plugins.zaloOas.find((oa) => oa.isDefault);

  return (
    <Container p={16}>
      <Stack gap={30}>
        <Card>
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
        </Card>

        {defaultZaloOa && (
          <Fragment>
            <Stack gap={5}>
              <SessionTitle name="gmf_groups" icon={IconUsersGroup} />
              <Card>
                <ZaloOaGmfGroups />
              </Card>
            </Stack>

            <Stack gap={5}>
              <SessionTitle name="zns_templates" icon={IconTemplate} />
              <Card>
                <SimpleGrid cols={{ md: 2 }}>
                  {Object.keys(plugins.znsTemplateConfigs).map((key) => {
                    const config = (plugins.znsTemplateConfigs as any)[key] as ZnsTemplateConfig;
                    const isvalid =
                      !config.workspaceTypes || config.workspaceTypes.includes(workspace.type);
                    if (!isvalid) return null;

                    return (
                      <ZaloOaZnsTemplateConfig
                        key={key}
                        config={config}
                        oa={defaultZaloOa}
                        templateId={key as any}
                      />
                    );
                  })}
                </SimpleGrid>
              </Card>
            </Stack>
          </Fragment>
        )}
      </Stack>
    </Container>
  );
};
