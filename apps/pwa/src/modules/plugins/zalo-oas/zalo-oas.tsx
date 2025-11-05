"use client";

import { Container } from "@/components/container";
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
import { String } from "@/utils/string.utils";
import { t } from "@lingui/core/macro";
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
import { SectionTitle } from "../../../components/session-title";
import { ZaloOaGmfGroups } from "./components/zalo-oa-gmf-groups";
import { ZaloOaZnsTemplateConfig } from "./components/zalo-oa-zns-template-config";
import { ZaloOasOnboarding } from "./components/zalo-oas-onboarding";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { Trans } from "@lingui/react/macro";

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
                      <Text fw={500}>{oa.info.name}</Text>

                      {oa.status === PluginZaloOaStatus.ACTIVE ? (
                        <Badge size="xs" color="green">
                          {t`Active`}
                        </Badge>
                      ) : (
                        <Badge size="xs" color="red">
                          {t`Inactive`}
                        </Badge>
                      )}
                    </Group>

                    <Tooltip label={oa.info.description} multiline withArrow>
                      <Text c="gray" fz={13}>
                        {String.limitCharacters(oa.info.description || "", 90)}
                      </Text>
                    </Tooltip>

                    <Group gap={5}>
                      {oa.info.package_name && (
                        <Badge variant="light" size="xs" color="blue">
                          {t`Package`}: {oa.info.package_name}
                        </Badge>
                      )}
                      {oa.isDefault && (
                        <Badge variant="light" size="xs" color="green">
                          {t`Default`}
                        </Badge>
                      )}
                    </Group>

                    <Group gap={8} mt={8}>
                      <Tooltip label={t`Set default`}>
                        <ActionIcon
                          onClick={() =>
                            onActionLoad({
                              icon: IconStackFront,
                              name: `${t`Set default`} ${oa.info.name}`,
                              process: () => setDefaultPluginZalo(oa._id),
                            })
                          }
                          variant="light"
                          color="green"
                          disabled={oa.isDefault}
                        >
                          <IconStackFront size={16} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label={t`Reconnect`}>
                        <ActionIcon
                          onClick={() =>
                            onActionLoad({
                              icon: IconRefresh,
                              name: `${t`Reconnect`} ${oa.info.name}`,
                              process: () => reconnectPluginZalo(oa._id),
                            })
                          }
                          variant="light"
                          color="green"
                        >
                          <IconRefresh size={16} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label={`${t`Disconect`} ${oa.info.name}`}>
                        <ActionIcon
                          onClick={() =>
                            onConfirmModal({
                              type: "danger",
                              icon: IconPuzzle,
                              title: `${t`Disconect`} ${oa.info.name}`,
                              content: <Trans>Are you sure you want to disconnect?</Trans>,
                              onConfirm: () => disconnectPluginZalo(oa._id),
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
              <SectionTitle name={t`GMF groups`} icon={IconUsersGroup} />
              <Card>
                <ZaloOaGmfGroups />
              </Card>
            </Stack>

            <Stack gap={5}>
              <SectionTitle name={t`ZNS templates`} icon={IconTemplate} />
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
