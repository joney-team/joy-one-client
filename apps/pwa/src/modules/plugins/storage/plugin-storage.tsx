"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { Errored } from "@/components/errored";
import { useColor } from "@/modules/theme/use-color";
import { getErrorMessage } from "@/utils/exceptions.utils";
import { useMutation, useQuery } from "@apollo/client/react";
import { formatBytes } from "@joy-one-client/utils/files";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Card,
  Code,
  CopyButton,
  Group,
  Skeleton,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconCloudDataConnection,
  IconCopy,
  IconEdit,
  IconLinkPlus,
  IconRefresh,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { MouseEventHandler, useRef, type FC } from "react";
import FETCH_EXTERNAL_STORAGE_SIZE, {
  type FetchExternalStorageSizeMutation,
  type FetchExternalStorageSizeMutationVariables,
} from "./mutationFetchExternalStorageSize.graphql";
import TOGGLE_DISABLE_PLUGIN_EXTERNAL_STORAGE, {
  type ToggleDisablePluginExternalStorageMutation,
  type ToggleDisablePluginExternalStorageMutationVariables,
} from "./mutationToggleDisablePluginExternalStorage.graphql";
import { pluginStorageProviders } from "./plugin-storage-constants";
import { PluginStorageModalRef } from "./plugin-storage-modal";
import HEALTHCHECK_PLUGIN_EXTERNAL_STORAGE, {
  type HealthcheckPluginExternalStorageMutation,
  type HealthcheckPluginExternalStorageMutationVariables,
} from "./queryHealthcheckPluginExternalStorage.graphql";
import GET_PLUGIN_EXTERNAL_STORAGE, {
  type PluginExternalStorageQuery,
  type PluginExternalStorageQueryVariables,
} from "./queryPluginExternalStorage.graphql";

const PluginStorageModal = dynamic(
  () => import("./plugin-storage-modal").then((mod) => mod.PluginStorageModal),
  {
    ssr: false,
  },
);

export const PluginStorage: FC = () => {
  const color = useColor();
  const storage = useQuery<PluginExternalStorageQuery, PluginExternalStorageQueryVariables>(
    GET_PLUGIN_EXTERNAL_STORAGE,
    {
      fetchPolicy: "cache-and-network",
    },
  );

  const pluginStorageModalRef = useRef<PluginStorageModalRef>(null);

  const [healthCheck, { loading: healthCheckLoading }] = useMutation<
    HealthcheckPluginExternalStorageMutation,
    HealthcheckPluginExternalStorageMutationVariables
  >(HEALTHCHECK_PLUGIN_EXTERNAL_STORAGE);

  const [fetchExternalStorageSize] = useMutation<
    FetchExternalStorageSizeMutation,
    FetchExternalStorageSizeMutationVariables
  >(FETCH_EXTERNAL_STORAGE_SIZE);

  const [toggleDisable] = useMutation<
    ToggleDisablePluginExternalStorageMutation,
    ToggleDisablePluginExternalStorageMutationVariables
  >(TOGGLE_DISABLE_PLUGIN_EXTERNAL_STORAGE);

  const onHealthCheck: MouseEventHandler = async (e) => {
    try {
      e.stopPropagation();
      await healthCheck();
      await fetchExternalStorageSize();
      await storage.refetch();
      notifications.show({
        color: "green",
        title: <Trans>Check connection</Trans>,
        message: <Trans>Connection successful</Trans>,
      });
    } catch (error) {
      notifications.show({
        color: "red",
        title: <Trans>Connection failed</Trans>,
        message: getErrorMessage(error),
      });
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
      <Stack align="center" py="md">
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

              <Button
                mt="sm"
                onClick={() => pluginStorageModalRef.current?.open()}
                leftIcon={IconLinkPlus}
              >
                <Trans>Connect</Trans>
              </Button>

              <PluginStorageModal ref={pluginStorageModalRef} />
            </Stack>
          </Card>
        </Container>
      </Stack>
    );
  }
  const { pluginExternalStorage: storageData } = storage.data;

  const provider = pluginStorageProviders[storageData.provider];

  const cors = JSON.stringify([
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "PUT"],
      AllowedOrigins: [window.location.origin],
      ExposeHeaders: [],
    },
  ]);

  return (
    <Stack align="center" py="md">
      <Container size={900}>
        <Stack>
          <Card>
            <Group align="start">
              <ThemeIcon variant="light" size="xl" color={color("primary")}>
                <IconCloudDataConnection size={50} />
              </ThemeIcon>
              <Stack gap={3} flex={1}>
                <Title order={5} c={color("primary")}>
                  {provider.name}
                </Title>

                <Text>Bucket: {storageData.bucketName}</Text>
                <Text>Region: {storageData.region}</Text>
                <Text>
                  <Trans>Capacity</Trans>:{" "}
                  {storageData.size ? formatBytes(storageData.size) : <Trans>Unknown</Trans>}
                </Text>

                <Group mt="sm" gap="xs">
                  <Tooltip label={<Trans>Refresh connection</Trans>}>
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
                      onClick={() => pluginStorageModalRef.current?.open(storageData)}
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Stack>

              <Stack>
                <Switch defaultChecked={!storageData.isDisabled} onChange={() => toggleDisable()} />
              </Stack>
            </Group>
          </Card>

          <Card>
            <Stack>
              <Group>
                <Stack gap={0} flex={1}>
                  <Text fw={600}>
                    <Trans>Cross-origin resource sharing (CORS)</Trans>
                  </Text>

                  <Text c="gray" fz="xs">
                    <Trans>
                      To allow our app to upload files to your storage, you need to configure CORS.
                    </Trans>{" "}
                    <Anchor
                      href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/enabling-cors-examples.html"
                      target="_blank"
                      fz="xs"
                    >
                      <Trans>Read docs</Trans>
                    </Anchor>
                  </Text>
                </Stack>

                <CopyButton value={cors}>
                  {({ copied, copy }) => (
                    <ActionIcon variant="light" size="md" color="gray" onClick={copy}>
                      {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                    </ActionIcon>
                  )}
                </CopyButton>
              </Group>

              <Code p="md">{cors}</Code>
            </Stack>
          </Card>
        </Stack>
      </Container>

      <PluginStorageModal ref={pluginStorageModalRef} />
    </Stack>
  );
};
