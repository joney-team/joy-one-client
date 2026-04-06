"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { Modal } from "@/components/modal/modal";
import { Renderer } from "@/components/renderer";
import { StorageKey } from "@/constants/storage-key";
import { MetaPageInfoStatus } from "@/graphql/enums.graphql";
import { MetaPageInfo } from "@/graphql/types.graphql";
import { useRouter } from "@/hooks/use-router";
import { onFacebookLogin } from "@/modules/auth/auth-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Anchor, Card, em, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCirclesRelation,
  IconMessageCircle,
  IconRefresh,
  IconStack,
} from "@tabler/icons-react";
import { type FC, Fragment, ReactNode, useState } from "react";
import ConnectMetaPagesDocument from "./graphql/connectMetaPages.graphql";
import GetMetaPagesInfosDocument from "./graphql/getMetaPagesInfos.graphql";

interface ModalConnectMetaPagesArgs {
  pages: MetaPageInfo[];
  accessToken: string;
}

export type OnModalConnectMetaPages = (args: ModalConnectMetaPagesArgs) => void;

export const ModalConnectMetaPages: FC<{
  children: (open: OnModalConnectMetaPages) => ReactNode;
}> = ({ children }) => {
  const client = useApolloClient();
  const workspace = useWorkspace();
  const router = useRouter();

  const [opened, { open, close }] = useDisclosure(false);
  const [args, setArgs] = useState<ModalConnectMetaPagesArgs>({ pages: [], accessToken: "" });
  const color = useColor();
  const [status, setStatus] = useState<"CONNECTING" | "CONNECTED" | "FAILED">("CONNECTING");

  const onConnect = async (modalArgs: ModalConnectMetaPagesArgs) => {
    try {
      await client.mutate({
        mutation: ConnectMetaPagesDocument,
        variables: { accessToken: modalArgs.accessToken },
      });
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
      const result = await client.query({
        query: GetMetaPagesInfosDocument,
        variables: { accessToken: authResponse.accessToken },
        fetchPolicy: "network-only",
      });
      const canConnectPages =
        result.data?.getMetaPagesInfos.filter((v) => v.status !== MetaPageInfoStatus.Connected) ??
        [];
      setArgs({ pages: canConnectPages, accessToken: authResponse.accessToken });

      if (canConnectPages.length > 0) await onConnect(args);
    } catch (error) {
      onError(error);
      setStatus("FAILED");
    }
  };

  const onOpenMessages = () => {
    router.push("/message-boxes");
    close();
  };

  return (
    <Fragment>
      {children((p) => {
        setStatus("CONNECTING");
        setArgs(p);
        onConnect(p);
        open();
      })}

      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        closeOnEscape={false}
        closeOnClickOutside={false}
        size="xl"
      >
        {opened && (
          <Stack align="center" p="md">
            <Renderer visible={args.pages.length > 0}>
              {(function () {
                if (status === "CONNECTED") {
                  return (
                    <Stack gap={8}>
                      <Title ta="center" c={color("primary")} fz={em(25)}>
                        <Trans>Connect success</Trans>
                      </Title>
                      <Text ta="center" fz={em(16)}>
                        <Trans>
                          Now you can use the <strong>Messages</strong> feature to communicate with
                          customers on Facebook.
                        </Trans>
                      </Text>
                    </Stack>
                  );
                }

                if (status === "FAILED") {
                  return (
                    <Fragment>
                      <Stack gap={8}>
                        <Title ta="center" c={color("dark")} fz={em(25)}>
                          <Trans>Failed to connect with Meta.</Trans>
                        </Title>
                        <Text ta="center" fz={em(16)}>
                          <Trans>Please try again later.</Trans>
                        </Text>
                      </Stack>

                      <Button
                        onClick={onRetry}
                        mt={20}
                        leftIcon={IconRefresh}
                        size="md"
                        radius={200}
                      >
                        <Trans>Retry now</Trans>
                      </Button>

                      <Anchor c="gray" fz={em(12)} onClick={close}>
                        <Trans>Skip for now</Trans>
                      </Anchor>
                    </Fragment>
                  );
                }

                return (
                  <Stack gap={8}>
                    <Title ta="center" c={color("primary")} fz={em(25)}>
                      <Trans>Connect Meta page</Trans>
                    </Title>
                    <Text ta="center" fz={em(16)}>
                      <Trans>
                        The system is automatically connecting to your Facebook pages. Please wait
                        for a moment.
                      </Trans>
                    </Text>
                  </Stack>
                );
              })()}

              {status === "CONNECTING" && (
                <Group gap={30}>
                  <Avatar workspace={workspace.member.workspace} size={55} />

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
                      {args.pages.map((page) => {
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
                    <Trans>Open messages</Trans>
                  </Button>

                  <Anchor c="gray" fz={em(12)} onClick={close}>
                    <Trans>Skip for now</Trans>
                  </Anchor>
                </Fragment>
              )}
            </Renderer>

            <Renderer visible={args.pages.length === 0}>
              <Stack gap={8}>
                <Title ta="center" c={color("primary")} fz={em(25)}>
                  <Trans>Failed to connect with Meta.</Trans>
                </Title>
                <Text ta="center" fz={em(16)}>
                  <Trans>Please try again later.</Trans>
                </Text>
              </Stack>

              <Button onClick={onRetry} mt={20} leftIcon={IconRefresh} size="md" radius={200}>
                <Trans>Retry now</Trans>
              </Button>

              <Anchor c="gray" fz={em(12)} onClick={close}>
                <Trans>Skip for now</Trans>
              </Anchor>
            </Renderer>
          </Stack>
        )}
      </Modal>
    </Fragment>
  );
};

export const WithConnectMetaPagesModal: FC<{
  children: (open: (dto: ModalConnectMetaPagesArgs) => void) => ReactNode;
}> = ({ children }) => {
  const workspace = useWorkspace();
  const router = useRouter();
  const client = useApolloClient();
  const color = useColor();

  const [opened, { open, close }] = useDisclosure(false);
  const [dto, setDto] = useState<ModalConnectMetaPagesArgs>({ pages: [], accessToken: "" });
  const [status, setStatus] = useState<"CONNECTING" | "CONNECTED" | "FAILED">("CONNECTING");

  const onConnect = async (dto: ModalConnectMetaPagesArgs) => {
    try {
      await client.mutate({
        mutation: ConnectMetaPagesDocument,
        variables: { accessToken: dto.accessToken },
      });
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
      const result = await client.query({
        query: GetMetaPagesInfosDocument,
        variables: { accessToken: authResponse.accessToken },
        fetchPolicy: "network-only",
      });
      const canConnectPages =
        result.data?.getMetaPagesInfos.filter((v) => v.status !== MetaPageInfoStatus.Connected) ??
        [];
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

  return (
    <Fragment>
      {children((p) => {
        setStatus("CONNECTING");
        setDto(p);
        onConnect(p);
        open();
      })}
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        closeOnEscape={false}
        closeOnClickOutside={false}
        size="xl"
      >
        {opened && (
          <Stack align="center" p="md">
            <Renderer visible={dto.pages.length > 0}>
              {(function () {
                if (status === "CONNECTED") {
                  return (
                    <Stack gap={8}>
                      <Title ta="center" c={color("primary")} fz={em(25)}>
                        <Trans>Connect success</Trans>
                      </Title>
                      <Text ta="center" fz={em(16)}>
                        <Trans>
                          Now you can use the <strong>Messages</strong> feature to communicate with
                          customers on Facebook.
                        </Trans>
                      </Text>
                    </Stack>
                  );
                }

                if (status === "FAILED") {
                  return (
                    <Fragment>
                      <Stack gap={8}>
                        <Title ta="center" c={color("dark")} fz={em(25)}>
                          <Trans>Failed to connect with Meta.</Trans>
                        </Title>
                        <Text ta="center" fz={em(16)}>
                          <Trans>Please try again later.</Trans>
                        </Text>
                      </Stack>

                      <Button
                        onClick={onRetry}
                        mt={20}
                        leftIcon={IconRefresh}
                        size="md"
                        radius={200}
                      >
                        <Trans>Retry now</Trans>
                      </Button>

                      <Anchor c="gray" fz={em(12)} onClick={close}>
                        <Trans>Skip for now</Trans>
                      </Anchor>
                    </Fragment>
                  );
                }

                return (
                  <Stack gap={8}>
                    <Title ta="center" c={color("primary")} fz={em(25)}>
                      <Trans>Connect Meta page</Trans>
                    </Title>
                    <Text ta="center" fz={em(16)}>
                      <Trans>
                        The system is automatically connecting to your Facebook pages. Please wait
                        for a moment.
                      </Trans>
                    </Text>
                  </Stack>
                );
              })()}

              {status === "CONNECTING" && (
                <Group gap={30}>
                  <Avatar workspace={workspace.member.workspace} size={55} />

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
                    <Trans>Open messages</Trans>
                  </Button>

                  <Anchor c="gray" fz={em(12)} onClick={close}>
                    <Trans>Skip for now</Trans>
                  </Anchor>
                </Fragment>
              )}
            </Renderer>

            <Renderer visible={dto.pages.length === 0}>
              <Stack gap={8}>
                <Title ta="center" c={color("primary")} fz={em(25)}>
                  <Trans>Failed to connect with Meta.</Trans>
                </Title>
                <Text ta="center" fz={em(16)}>
                  <Trans>Please try again later.</Trans>
                </Text>
              </Stack>

              <Button onClick={onRetry} mt={20} leftIcon={IconRefresh} size="md" radius={200}>
                <Trans>Retry now</Trans>
              </Button>

              <Anchor c="gray" fz={em(12)} onClick={close}>
                <Trans>Skip for now</Trans>
              </Anchor>
            </Renderer>
          </Stack>
        )}
      </Modal>
    </Fragment>
  );
};
