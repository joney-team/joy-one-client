"use client";

import { Button } from "@/components/buttons/button";
import { Form } from "@/components/form";
import { ModalHead } from "@/components/modal/modal-head";
import { PluginExternalStorageProvider } from "@/graphql/enums.graphql";
import { SetPluginExternalStorageInput } from "@/graphql/types.graphql";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Group, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCloudDataConnection } from "@tabler/icons-react";
import { forwardRef, Fragment, type ReactNode, useImperativeHandle, useState } from "react";
import GetPluginExternalStorageDocument, {
  GetPluginExternalStorageQuery,
} from "./graphql/getPluginExternalStorage.graphql";
import SetPluginExternalStorageDocument from "./graphql/setPluginExternalStorage.graphql";
import { pluginStorageProviders } from "./plugin-storage-constants";

const PluginStorageModalContent = ({
  isOpened,
  onClose,
  storage,
}: {
  isOpened: boolean;
  onClose: () => void;
  storage?: GetPluginExternalStorageQuery["pluginExternalStorage"];
}) => {
  const [setPluginExternalStorage] = useMutation(SetPluginExternalStorageDocument);

  const form = useForm<SetPluginExternalStorageInput>({
    initialValues: {
      provider: PluginExternalStorageProvider.AwsS3,
    },
  });

  const onSubmit = form.onSubmit(async (input) => {
    try {
      await setPluginExternalStorage({
        variables: { input },
        refetchQueries: [GetPluginExternalStorageDocument],
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
      <Form onSubmit={onSubmit} autoFocus={false}>
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
            <Button type="submit" loading={form.submitting}>
              {storage ? <Trans>Save</Trans> : <Trans>Connect</Trans>}
            </Button>
          </Group>
        </Stack>
      </Form>
    </Modal>
  );
};

export type PluginStorageModalRef = {
  open: (storage?: GetPluginExternalStorageQuery["pluginExternalStorage"]) => void;
  close: () => void;
};

export const PluginStorageModal = forwardRef<
  PluginStorageModalRef,
  {
    children?: (ref: PluginStorageModalRef) => ReactNode;
  }
>(({ children }, ref) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [storage, setStorage] = useState<
    GetPluginExternalStorageQuery["pluginExternalStorage"] | null
  >(null);

  useImperativeHandle(ref, () => ({
    open: (storage) => {
      setStorage(storage ?? null);
      open();
    },
    close: () => {
      close();
    },
  }));

  return (
    <Fragment>
      {children?.({
        open: (storage) => {
          setStorage(storage ?? null);
        },
        close: () => {
          setStorage(null);
        },
      })}

      <PluginStorageModalContent isOpened={opened} storage={storage} onClose={close} />
    </Fragment>
  );
});
