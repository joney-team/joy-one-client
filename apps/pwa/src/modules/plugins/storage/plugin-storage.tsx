"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { useMutation, useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconCloudDataConnection, IconEdit, IconLinkPlus, IconRefresh } from "@tabler/icons-react";
import { MouseEventHandler, type FC } from "react";
import { pluginStorageProviders } from "./plugin-storage-constants";
import { WithPluginStorageModal } from "./plugin-storage-modal";
import HEALTHCHECK_PLUGIN_EXTERNAL_STORAGE, {
  type HealthcheckPluginExternalStorageMutation,
  type HealthcheckPluginExternalStorageMutationVariables,
} from "./queryHealthcheckPluginExternalStorage.graphql";
import GET_PLUGIN_EXTERNAL_STORAGE, {
  type PluginExternalStorageQuery,
  type PluginExternalStorageQueryVariables,
} from "./queryPluginExternalStorage.graphql";

export const PluginStorage: FC = () => {
  const color = useColor();
  const storage = useQuery<PluginExternalStorageQuery, PluginExternalStorageQueryVariables>(
    GET_PLUGIN_EXTERNAL_STORAGE
  );

  const [healthCheck, { loading: healthCheckLoading }] = useMutation<
    HealthcheckPluginExternalStorageMutation,
    HealthcheckPluginExternalStorageMutationVariables
  >(HEALTHCHECK_PLUGIN_EXTERNAL_STORAGE);

  const onHealthCheck: MouseEventHandler = async (e) => {
    try {
      e.stopPropagation();
      await healthCheck();
    } catch (error) {
      onError(error);
    }
  };

  if (storage.loading) {
    return (
      <Stack py={20}>
        <Skeleton height={200} />
      </Stack>
    );
  }

  if (storage.error) {
    return (
      <Stack py={20}>
        <Errored error={storage.error} />
      </Stack>
    );
  }

  if (!storage.data?.pluginExternalStorage) {
    return (
      <Stack align="center" py={30}>
        <Container>
          <Card>
            <Stack align="center" py={15}>
              <Group gap={30}>
                <ThemeIcon variant="light" size="xl" color={color("primary")}>
                  <IconCloudDataConnection size={50} />
                </ThemeIcon>
              </Group>

              <Stack gap={0}>
                <Title ta="center" order={2} fw={300} c={color("primary")}>
                  <Trans>Connect Cloud Storage</Trans>
                </Title>

                <Text ta="center">
                  <Trans>Integrate with cloud storage services: S3, ...</Trans>
                </Text>
              </Stack>

              <WithPluginStorageModal>
                {(open) => (
                  <Button mt={10} action onClick={() => open()} leftIcon={IconLinkPlus}>
                    <Trans>Connect</Trans>
                  </Button>
                )}
              </WithPluginStorageModal>
            </Stack>
          </Card>
        </Container>
      </Stack>
    );
  }

  return (
    <Stack align="center" py={20}>
      <WithPluginStorageModal>
        {(open) => {
          if (!storage.data.pluginExternalStorage) return null;

          const { pluginExternalStorage: storageData } = storage.data;

          const provider = pluginStorageProviders[storageData.provider];

          return (
            <Container size={500}>
              <Card>
                <Group align="start">
                  <ThemeIcon variant="light" size="xl" color={color("primary")}>
                    <IconCloudDataConnection size={50} />
                  </ThemeIcon>
                  <Stack gap={3}>
                    <Title order={5} c={color("primary")}>
                      {provider.name}
                    </Title>

                    <Text>Bucket: {storageData.bucketName}</Text>
                    <Text>Region: {storageData.region}</Text>

                    <Group mt="sm" gap="xs">
                      <Tooltip label={<Trans>Check connection</Trans>}>
                        <ActionIcon
                          variant="light"
                          size="md"
                          color="gray"
                          onClick={onHealthCheck}
                          loading={healthCheckLoading}
                        >
                          <IconRefresh size={18} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label={<Trans>Edit</Trans>}>
                        <ActionIcon
                          color="gray"
                          variant="light"
                          size="md"
                          onClick={() => open(storageData)}
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Stack>
                </Group>
              </Card>
            </Container>
          );
        }}
      </WithPluginStorageModal>
    </Stack>
  );
};
