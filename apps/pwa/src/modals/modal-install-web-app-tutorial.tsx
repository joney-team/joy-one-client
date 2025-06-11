"use client";

import { useLayout } from "@/layout/layout-context";
import { Anchor, Center, Modal, Stack, Text, Title, em } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDotsVertical, IconShare2, IconSquarePlus } from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { Image } from "../components/image";

export let OnInstallWebAppTutorial = () => {};

export const ModalInstallWebAppTutorial: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const viewport = useLayout();

  OnInstallWebAppTutorial = () => open();

  if (viewport.view === "desktop") return null;

  return (
    <Modal opened={opened} onClose={close} withCloseButton={false} size={800} yOffset={10} centered>
      <Stack align="center" py={10}>
        <Center>
          <Image src="/images/add-to-home-head.png" maw="100%" w={250} />
        </Center>

        <Title order={2} c="primary">
          Cài Đặt Web App Ngay!
        </Title>

        <Text>• Tối ưu không gian thao tác</Text>
        <Text mb={16}>• Nhận thông báo khi offline</Text>

        {(function () {
          if (viewport.isAndroid)
            return (
              <Fragment>
                <Text w="100%" ta="center">
                  Bấm <strong>Cài đặt</strong> <IconDotsVertical style={{ marginBottom: -6 }} />
                </Text>
                <Text w="100%" ta="center">
                  Chọn <strong>Cài đặt ứng dụng</strong>
                </Text>

                <Center>
                  <Image src="/images/install-android.png" maw="100%" w={250} />
                </Center>
              </Fragment>
            );

          return (
            <Fragment>
              <Text w="100%" ta="center">
                Bấm <strong>Chia sẻ website</strong> <IconShare2 style={{ marginBottom: -3 }} />
              </Text>
              <Text w="100%" ta="center">
                Chọn <strong>Thêm vào MH Chính</strong>{" "}
                <IconSquarePlus style={{ marginBottom: -5 }} />
              </Text>

              <Center>
                <Image src="/images/install-ios.png" maw="100%" w={250} />
              </Center>
            </Fragment>
          );
        })()}

        <Center mt={16}>
          <Anchor onClick={close} c="gray" fz={em(13)}>
            Dùng giao diện trình duyệt
          </Anchor>
        </Center>
      </Stack>
    </Modal>
  );
};
