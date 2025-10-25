"use client";

import { configs } from "@/configs/layout.config";
import LangProvider from "@/modules/lang/lang-provider";
import { primaryColors } from "@joy-one-client/config/colors";
import { Trans } from "@lingui/react/macro";
import {
  Button,
  Container,
  createTheme,
  Group,
  MantineProvider,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import * as Sentry from "@sentry/react";
import { IconHome, IconLifebuoy, IconRefresh } from "@tabler/icons-react";
import Link from "next/link";
import { FC, useEffect } from "react";
import { IconErrored } from "./icons";

interface ErrorBoundaryProps {
  error: any;
  reset: () => void;
}

const Content: FC<ErrorBoundaryProps> = (props) => {
  const isHome = window?.location?.pathname === "/";

  useEffect(() => {
    Sentry.captureException(props.error);
  }, []);

  return (
    <Container size="sm">
      <Stack align="center" justify="center" mih="100dvh">
        <IconErrored width={300} />
        <Title fz={22} ta="center">
          <Trans>Oops! Something went wrong...</Trans>
        </Title>
        <Text ta="center">
          <Trans>
            We apologize for the inconvenience, our technical team has noted it and will handle it
            soon. If it is urgent, please contact us.
          </Trans>
        </Text>
        <Group mt={16} justify="center">
          {!isHome && (
            <Button
              variant="outline"
              onClick={() => window.location.replace("/")}
              leftSection={<IconHome size={20} style={{ marginRight: -5 }} />}
            >
              <Trans>Back to home</Trans>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => props.reset()}
            leftSection={<IconRefresh size={20} style={{ marginRight: -5 }} />}
          >
            <Trans>Reset</Trans>
          </Button>

          <Button
            component={Link}
            href={configs.socialLinks[0].link}
            target="_blank"
            leftSection={<IconLifebuoy size={20} style={{ marginRight: -5 }} />}
          >
            <Trans>Contact support</Trans>
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};

export const ErrorBoundary: FC<ErrorBoundaryProps> = (props) => {
  return (
    <LangProvider>
      <MantineProvider theme={createTheme({ colors: { primary: primaryColors } })}>
        <Modal
          opened
          onClose={() => {}}
          closeOnEscape={false}
          withCloseButton={false}
          fullScreen
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <Content {...props} />
        </Modal>
      </MantineProvider>
    </LangProvider>
  );
};

export default ErrorBoundary;
