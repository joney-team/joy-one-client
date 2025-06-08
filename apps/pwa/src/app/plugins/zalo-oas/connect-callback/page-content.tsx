"use client";

import config from "@joy-one-client/config";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { Image } from "@/components/image";
import { Loading } from "@/components/loading";
import { useLayout } from "@/layout/layout-context";
import { num } from "@/modules/lang/lang-service";
import { connectCallbackPluginZalo, connectPluginZalo } from "@/modules/plugins/zalo-oas/zalo-oas-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useFetch } from "@/utils/use-fetch.util";
import { Anchor, Center, Group, Stack, Text, ThemeIcon, Title, em } from "@mantine/core";
import { IconCirclesRelation } from "@tabler/icons-react";
import { NextPage } from "next";
import { useEffect, useState } from "react";

let interval: NodeJS.Timeout;

const Page: NextPage = () => {
  const viewport = useLayout();
  const workspace = useWorkspace();
  const [tick, setTick] = useState(5);

  const onDone = () => {
    window.close();
  };

  const connect = useFetch({
    fetch: async () => {
      const search = new URLSearchParams(window.location.search);
      const res = await connectCallbackPluginZalo({ code: search.get("code")! });
      interval = setInterval(() => {
        setTick((tick) => {
          if (tick <= 0) {
            clearInterval(interval);
            return tick;
          }

          return tick - 1;
        });
      }, 1000);
      return res;
    },
  });

  useEffect(() => {
    if (tick <= 0) {
      clearInterval(interval);
      onDone();
    }
  }, [tick]);

  useEffect(() => {
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <Stack
      style={{
        height: viewport.height,
      }}
      justify="center"
      align="center"
    >
      <Group gap={30} mb={20}>
        <Avatar workspace={workspace.userMember.workspace} size={100} />
        <ThemeIcon variant="transparent" size="lg" color="dark">
          <IconCirclesRelation size={50} />
        </ThemeIcon>
        <Image w={85} src="/images/plugins-zalo-oa.png" />
      </Group>

      {(function () {
        if (connect.isFetching) return <Loading message="Đang kết nối ..." />;
        if (connect.error)
          return (
            <>
              <Errored error={connect.error} />
              <Center>
                <Button onClick={() => connectPluginZalo()}>Thử lại</Button>
              </Center>

              <Anchor
                fz={em(13)}
                fw={500}
                c="gray"
                onClick={() => window.location.replace(`${config.APP_URL}/plugins/zalo`)}
              >
                Thoát
              </Anchor>
            </>
          );

        return (
          <>
            <Title ta="center" order={2} fw={300}>
              Kết nối thành công
            </Title>
            <Text ta="center">Tự động trở về trong {num(tick)}s...</Text>

            <Center>
              <Button onClick={onDone}>Trở về</Button>
            </Center>
          </>
        );
      })()}
    </Stack>
  );
};

export default Page;
