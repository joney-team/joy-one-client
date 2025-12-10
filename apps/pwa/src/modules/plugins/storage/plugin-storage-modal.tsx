import { Button } from "@/components/buttons/button";
import { Form } from "@/components/form";
import { ModalHead } from "@/components/modal/modal-head";
import { PluginExternalStorageProvider } from "@/graphql/enums.graphql";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Group, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCloudDataConnection } from "@tabler/icons-react";
import React, { useState } from "react";
import SET_PLUGIN_EXTERNAL_STORAGE, {
  type SetPluginExternalStorageMutation,
  type SetPluginExternalStorageMutationVariables,
} from "./mutationSetPluginExternalStorage.graphql";
import { pluginStorageProviders } from "./plugin-storage-constants";
import GET_PLUGIN_EXTERNAL_STORAGE, {
  type PluginExternalStorageQuery,
} from "./queryPluginExternalStorage.graphql";

export const PluginStorageModal = ({
  isOpened,
  onClose,
  storage,
}: {
  isOpened: boolean;
  onClose: () => void;
  storage?: PluginExternalStorageQuery["pluginExternalStorage"];
}) => {
  const [setPluginExternalStorage] = useMutation<
    SetPluginExternalStorageMutation,
    SetPluginExternalStorageMutationVariables
  >(SET_PLUGIN_EXTERNAL_STORAGE);

  const form = useForm<SetPluginExternalStorageMutationVariables>({
    initialValues: {
      provider: PluginExternalStorageProvider.AwsS3,
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      await setPluginExternalStorage({
        variables: values,
        refetchQueries: [GET_PLUGIN_EXTERNAL_STORAGE],
      });
      onClose();
    } catch (error) {
      onError(error);
    }
  });

  return (
    <Modal
      opened={isOpened}
      onClose={onClose}
      title={
        <ModalHead
          name={storage ? <Trans>Edit Cloud Storage</Trans> : <Trans>Connect Cloud Storage</Trans>}
          icon={IconCloudDataConnection}
        />
      }
    >
      <Form onSubmit={onSubmit}>
        <Stack>
          <Select
            {...form.getInputProps("provider")}
            label={<Trans>Provider</Trans>}
            data={Object.entries(pluginStorageProviders).map(([key, value]) => ({
              label: value.name,
              value: key,
            }))}
          />

          <TextInput
            {...form.getInputProps("accessKeyId")}
            placeholder={storage ? "*********" : undefined}
            label="Access Key ID"
          />

          <TextInput
            {...form.getInputProps("secretAccessKey")}
            label="Secret Access Key"
            placeholder={storage ? "*********" : undefined}
          />

          <TextInput
            {...form.getInputProps("region")}
            defaultValue={storage?.region ?? undefined}
            label="Region"
          />

          <TextInput
            {...form.getInputProps("bucketName")}
            defaultValue={storage?.bucketName ?? undefined}
            label="Bucket"
          />

          <TextInput
            {...form.getInputProps("endpointUrl")}
            defaultValue={storage?.endpointUrl ?? undefined}
            label={<Trans>Endpoint URL</Trans>}
          />

          <Group justify="center">
            <Button action type="submit" loading={form.submitting}>
              {storage ? <Trans>Save</Trans> : <Trans>Connect</Trans>}
            </Button>
          </Group>
        </Stack>
      </Form>
    </Modal>
  );
};

export const WithPluginStorageModal = ({
  children,
}: {
  children: (
    open: (storage?: PluginExternalStorageQuery["pluginExternalStorage"]) => void
  ) => React.ReactNode;
}) => {
  const [isOpened, { open, close }] = useDisclosure(false);
  const [storage, setStorage] = useState<
    PluginExternalStorageQuery["pluginExternalStorage"] | null
  >(null);
  return (
    <>
      {children((storage) => {
        setStorage(storage ?? null);
        open();
      })}
      <PluginStorageModal isOpened={isOpened} onClose={close} storage={storage} />
    </>
  );
};
