"use client";

import { useApp } from "@/app.context";
import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { Modal } from "@/components/modal/modal";
import { getAppConfig } from "@/service";
import { Trans } from "@lingui/react/macro";
import { Anchor, Group, Stack, Text, Title, em } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC, useEffect } from "react";

export const ModalUpgradeVersion: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const app = useApp();

  const detectChangeVersion = async (currentVersion: string) => {
    try {
      const _config = await getAppConfig();
      if (_config.version !== currentVersion) {
        open();
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (app.config && app.config.version) {
      const interval = setInterval(() => detectChangeVersion(app.config!.version), 1000 * 60 * 3);

      return () => {
        clearInterval(interval);
      };
    }
  }, [app.config?.version]);

  return (
    <Modal opened={opened} onClose={close} withCloseButton={false}>
      <Stack align="center" p={20}>
        <Image src="/images/upgrade-version.png" w={200} />
        <Title c="primary" ta="center" fz={em(25)} tt="capitalize" fw={500}>
          <Trans>New version available!</Trans>
        </Title>
        <Text ta="center">
          <Trans>
            We are very grateful for your use of our product. We have made some improvements and bug
            fixes.
            <br />
            <br />
            Reload the page to update.
          </Trans>
        </Text>

        <Group justify="center">
          <Button onClick={() => window.location.reload()}>
            <Trans>Update now</Trans>
          </Button>
        </Group>

        <Anchor c="gray" fz={em(12)} onClick={() => close()}>
          <Trans>Skip</Trans>
        </Anchor>
      </Stack>
    </Modal>
  );
};
