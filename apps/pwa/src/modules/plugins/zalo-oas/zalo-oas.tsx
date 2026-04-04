"use client";

import { Container } from "@/components/container";
import { PluginZaloOaStatus } from "@/graphql/enums.graphql";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { ZnsTemplateConfig } from "@/modules/plugins/zalo-oas/zalo-oas-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad } from "@/utils/actions";
import { String } from "@/utils/string.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
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
import ReconnectZaloOaDocument from "./graphql/reconnectZaloOa.graphql";
import RemoveZaloOaDocument from "./graphql/removeZaloOa.graphql";
import SetZaloOaDefaultDocument from "./graphql/setZaloOaDefault.graphql";

export const PluginZaloOAs: FC = () => {
  const workspace = useWorkspace();
  const plugins = usePlugins();
  const client = useApolloClient();

  if (plugins.zaloOas.length === 0) return <ZaloOasOnboarding />;

  const defaultZaloOa = plugins.zaloOas.find((oa) => oa.isDefault);

  return (
    <Container p="md">
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

                      {oa.status === PluginZaloOaStatus.Active ? (
                        <Badge size="xs" color="green">
                          <Trans>Active</Trans>
                        </Badge>
                      ) : (
                        <Badge size="xs" color="red">
                          <Trans>Inactive</Trans>
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
                          <Trans>Package</Trans>: {oa.info.package_name}
                        </Badge>
                      )}
                      {oa.isDefault && (
                        <Badge variant="light" size="xs" color="green">
                          <Trans>Default</Trans>
                        </Badge>
                      )}
                    </Group>

                    <Group gap={8} mt={8}>
                      <Tooltip label={<Trans>Set default</Trans>}>
                        <ActionIcon
                          onClick={() =>
                            onActionLoad({
                              icon: IconStackFront,
                              name: <Trans>Set default {oa.info.name}</Trans>,
                              process: () =>
                                client.mutate({
                                  mutation: SetZaloOaDefaultDocument,
                                  variables: { zaloOaId: oa._id },
                                }),
                            })
                          }
                          variant="light"
                          color="green"
                          disabled={oa.isDefault}
                        >
                          <IconStackFront size={16} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label={<Trans>Reconnect</Trans>}>
                        <ActionIcon
                          onClick={() =>
                            onActionLoad({
                              icon: IconRefresh,
                              name: <Trans>Reconnect {oa.info.name}</Trans>,
                              process: () =>
                                client.mutate({
                                  mutation: ReconnectZaloOaDocument,
                                  variables: {
                                    zaloOaId: oa._id,
                                  },
                                }),
                            })
                          }
                          variant="light"
                          color="green"
                        >
                          <IconRefresh size={16} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label={<Trans>Disconnect {oa.info.name}</Trans>}>
                        <ActionIcon
                          onClick={() =>
                            onConfirmModal({
                              type: "danger",
                              icon: IconPuzzle,
                              title: <Trans>Disconnect {oa.info.name}</Trans>,
                              content: <Trans>Are you sure you want to disconnect?</Trans>,
                              onConfirm: () =>
                                client.mutate({
                                  mutation: RemoveZaloOaDocument,
                                  variables: {
                                    zaloOaId: oa._id,
                                  },
                                }),
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
              <SectionTitle name={<Trans>GMF groups</Trans>} icon={IconUsersGroup} />
              <Card>
                <ZaloOaGmfGroups />
              </Card>
            </Stack>

            <Stack gap={5}>
              <SectionTitle name={<Trans>ZNS templates</Trans>} icon={IconTemplate} />
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
