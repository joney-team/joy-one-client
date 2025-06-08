import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { useApp } from "@/app.context";
import { getAppConfig } from "@/service";
import { Anchor, Group, Modal, Stack, Text, Title, em } from "@mantine/core";
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
          Có phiên bản mới xịn hơn!
        </Title>
        <Text ta="center">
          Đội ngũ Joy One rất cảm ơn bạn đã sử dụng sản phẩm, chúng mình đã thực hiện một số cải tiến và sửa lỗi.
          <br />
          <br />
          Tải lại trang để cập nhật.
        </Text>

        <Group justify="center">
          <Button color="joyone" onClick={() => window.location.reload()}>
            Cập nhật ngay
          </Button>
        </Group>

        <Anchor c="gray" fz={em(12)} onClick={() => close()}>
          Bỏ qua
        </Anchor>
      </Stack>
    </Modal>
  );
};
