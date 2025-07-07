"use client";

import { configs } from "@/configs/layout.config";
import LangProvider from "@/modules/lang/lang-provider";
import { t } from "@/modules/lang/lang-service";
import { primaryColors } from "@joy-one-client/config/colors";
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
import { IconHome, IconLifebuoy, IconRefresh } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";
import { IconErrored } from "./icons";

interface ErrorBoundaryProps {
  error: any;
  reset: () => void;
}

const Content: FC<ErrorBoundaryProps> = (props) => {
  const isHome = window?.location?.pathname === "/";

  // useEffect(() => {
  //   if (lang.isReady) {
  //     // if (config.SENTRY_DSN) {
  //     //   Sentry.init({
  //     //     dsn: config.SENTRY_DSN,
  //     //     integrations: [],
  //     //   });
  //     //   Sentry.captureException(props.error);
  //     // }
  //   }
  // }, [lang.isReady]);

  return (
    <Container size="sm">
      <Stack align="center" justify="center" mih="100dvh">
        <IconErrored width={300} />
        <Title fz={22} ta="center">
          {t("error_msg")}
        </Title>
        <Text ta="center">{t("error_msg_desc")}</Text>
        <Group mt={16} justify="center">
          {!isHome && (
            <Button
              variant="outline"
              onClick={() => window.location.replace("/")}
              leftSection={<IconHome size={20} style={{ marginRight: -5 }} />}
            >
              {t("back_to_home")}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => props.reset()}
            leftSection={<IconRefresh size={20} style={{ marginRight: -5 }} />}
          >
            {t("reset")}
          </Button>

          <Button
            component={Link}
            href={configs.socialLinks[0].link}
            target="_blank"
            leftSection={<IconLifebuoy size={20} style={{ marginRight: -5 }} />}
          >
            {t("contact_support")}
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
