"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { Renderer } from "@/components/renderer";
import { useRouter } from "@/hooks/use-router";
import { api } from "@/modules/apis";
import { onFacebookLogin } from "@/modules/auth/auth-service";
import { tl } from "@/modules/lang/lang-service";
import { getPluginMetaPagesInfo } from "@/modules/plugins/meta-pages/meta-pages-service";
import { PluginMetaPageInfo } from "@/modules/plugins/meta-pages/meta-pages-types";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { StorageKey } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { Anchor, Card, em, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCirclesRelation,
  IconMessageCircle,
  IconRefresh,
  IconStack,
} from "@tabler/icons-react";
import { type FC, Fragment, useState } from "react";

interface OnConnectMetaPagesDto {
  pages: PluginMetaPageInfo[];
  accessToken: string;
}

export let OnConnectMetaPagesModal: (dto: OnConnectMetaPagesDto) => void = () => {};

export const ConnectMetaPagesModal: FC = () => {
  const workspace = useWorkspace();
  const router = useRouter();

  const [opened, { open, close }] = useDisclosure(false);
  const [dto, setDto] = useState<OnConnectMetaPagesDto>({ pages: [], accessToken: "" });
  const color = useColor();
  const [status, setStatus] = useState<"CONNECTING" | "CONNECTED" | "FAILED">("CONNECTING");

  const onConnect = async (dto: OnConnectMetaPagesDto) => {
    try {
      await api.post(`/plugins/meta-pages/connect`, { accessToken: dto.accessToken });
      localStorage.removeItem(StorageKey.META_ACCESS_TOKEN);
      setStatus("CONNECTED");
    } catch (error) {
      setStatus("FAILED");
    }
  };

  const onRetry = async () => {
    try {
      setStatus("CONNECTING");
      const authResponse = await onFacebookLogin();
      const { pages } = await getPluginMetaPagesInfo(authResponse.accessToken);
      const canConnectPages = pages.filter((v) => v.status !== "CONNECTED");
      setDto({ pages: canConnectPages, accessToken: authResponse.accessToken });

      if (canConnectPages.length > 0) await onConnect(dto);
    } catch (error) {
      onError(error);
      setStatus("FAILED");
    }
  };

  const onOpenMessages = () => {
    router.push("/message-boxes");
    close();
  };

  OnConnectMetaPagesModal = (p) => {
    setStatus("CONNECTING");
    setDto(p);
    onConnect(p);
    open();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      closeOnEscape={false}
      closeOnClickOutside={false}
      size="xl"
    >
      {opened && (
        <Stack align="center" p={16}>
          <Renderer visible={dto.pages.length > 0}>
            {(function () {
              if (status === "CONNECTED") {
                return (
                  <Stack gap={8}>
                    <Title ta="center" c={color("primary")} fz={em(25)}>
                      {tl("connect_success")}
                    </Title>
                    <Text ta="center" fz={em(16)}>
                      {tl("connect_success_msg")}
                    </Text>
                  </Stack>
                );
              }

              if (status === "FAILED") {
                return (
                  <Fragment>
                    <Stack gap={8}>
                      <Title ta="center" c={color("dark")} fz={em(25)}>
                        {tl("connect_meta_failed")}
                      </Title>
                      <Text ta="center" fz={em(16)}>
                        {tl("please_try_again_later")}
                      </Text>
                    </Stack>

                    <Button onClick={onRetry} mt={20} leftIcon={IconRefresh} size="md" radius={200}>
                      {tl("retry_now")}
                    </Button>

                    <Anchor c="gray" fz={em(12)} onClick={close}>
                      {tl("skip_for_now")}
                    </Anchor>
                  </Fragment>
                );
              }

              return (
                <Stack gap={8}>
                  <Title ta="center" c={color("primary")} fz={em(25)}>
                    {tl("connect_meta_page")}
                  </Title>
                  <Text ta="center" fz={em(16)}>
                    {tl("auto_connect_meta_page")}
                  </Text>
                </Stack>
              );
            })()}

            {status === "CONNECTING" && (
              <Group gap={30}>
                <Avatar workspace={workspace.userMember.workspace} size={55} />

                <ThemeIcon variant="transparent" size="lg" color="dark">
                  <IconCirclesRelation size={50} className="animPulse" />
                </ThemeIcon>

                <Image w={55} src="/images/plugins-meta-pages.svg" />
              </Group>
            )}

            {status === "CONNECTED" && (
              <Fragment>
                <Stack align="center" gap={5}>
                  <Group>
                    {dto.pages.map((page) => {
                      return (
                        <Card key={page.pageId} withBorder shadow="none" p={10}>
                          <Group gap={10} wrap="nowrap">
                            <Avatar src={page.avatar} size={40}>
                              <IconStack />
                            </Avatar>

                            <Stack gap={0}>
                              <Text fw={500}>{page.name}</Text>
                              <Text fz={12} c="gray">
                                {page.categories.map((v) => v.name).join(" • ")}
                              </Text>
                            </Stack>
                          </Group>
                        </Card>
                      );
                    })}
                  </Group>
                </Stack>

                <Button
                  onClick={onOpenMessages}
                  mt={20}
                  leftIcon={IconMessageCircle}
                  size="md"
                  radius={200}
                >
                  {`${tl("open")} ${tl("messages")}`}
                </Button>

                <Anchor c="gray" fz={em(12)} onClick={close}>
                  {tl("skip_for_now")}
                </Anchor>
              </Fragment>
            )}
          </Renderer>

          <Renderer visible={dto.pages.length === 0}>
            <Stack gap={8}>
              <Title ta="center" c={color("primary")} fz={em(25)}>
                {tl("connect_meta_failed")}
              </Title>
              <Text ta="center" fz={em(16)}>
                {tl("connect_zero_meta_pages")}
              </Text>
            </Stack>

            <Button onClick={onRetry} mt={20} leftIcon={IconRefresh} size="md" radius={200}>
              {tl("reconnect")}
            </Button>

            <Anchor c="gray" fz={em(12)} onClick={close}>
              {tl("skip_for_now")}
            </Anchor>
          </Renderer>
        </Stack>
      )}
    </Modal>
  );
};
