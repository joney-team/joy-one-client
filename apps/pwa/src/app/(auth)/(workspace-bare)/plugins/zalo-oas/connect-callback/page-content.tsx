"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { Image } from "@/components/image";
import { Loading } from "@/components/loading";
import { useLayout } from "@/layout/layout-context";
import ConnectZaloOaDocument from "@/modules/plugins/zalo-oas/graphql/connectZaloOa.graphql";
import ConnectZaloOaCallbackDocument from "@/modules/plugins/zalo-oas/graphql/connectZaloOaCallback.graphql";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useFetch } from "@/utils/use-fetch.util";
import { useApolloClient } from "@apollo/client/react";
import config from "@joy-one/config";
import { Trans } from "@lingui/react/macro";
import { Anchor, Center, Group, Stack, Text, ThemeIcon, Title, em } from "@mantine/core";
import { IconCirclesRelation } from "@tabler/icons-react";
import { NextPage } from "next";
import { Fragment, useEffect, useState } from "react";

let interval: NodeJS.Timeout;

const Page: NextPage = () => {
  const viewport = useLayout();
  const workspace = useWorkspace();
  const client = useApolloClient();
  const [tick, setTick] = useState(5);

  const onDone = () => {
    window.close();
  };

  const connect = useFetch({
    fetch: async () => {
      const search = new URLSearchParams(window.location.search);
      const res = await client.mutate({
        mutation: ConnectZaloOaCallbackDocument,
        variables: {
          code: search.get("code")!,
        },
      });
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
        <Avatar workspace={workspace.member.workspace} size={100} />
        <ThemeIcon variant="transparent" size="lg" color="dark">
          <IconCirclesRelation size={50} />
        </ThemeIcon>
        <Image w={85} src="/images/plugins-zalo-oa.png" />
      </Group>

      {(function () {
        if (connect.isFetching) return <Loading message={<Trans>Connecting...</Trans>} />;
        if (connect.error)
          return (
            <Fragment>
              <Errored error={connect.error} />
              <Center>
                <Button
                  onClick={() =>
                    client
                      .mutate({
                        mutation: ConnectZaloOaDocument,
                      })
                      .then((result) => {
                        window.open(result.data?.connectZaloOa?.url, "_blank");
                      })
                  }
                >
                  Thử lại
                </Button>
              </Center>

              <Anchor
                fz={em(13)}
                fw={500}
                c="gray"
                onClick={() =>
                  window.location.replace(`${config.APP_URL}/workspace-settings/plugins/zalo-oas`)
                }
              >
                <Trans>Exit</Trans>
              </Anchor>
            </Fragment>
          );

        return (
          <Fragment>
            <Title ta="center" order={2} fw={300}>
              <Trans>Connect successfully</Trans>
            </Title>
            <Text ta="center">
              <Trans>Automatically returning in {tick}s...</Trans>
            </Text>

            <Center>
              <Button onClick={onDone}>
                <Trans>Return</Trans>
              </Button>
            </Center>
          </Fragment>
        );
      })()}
    </Stack>
  );
};

export default Page;
