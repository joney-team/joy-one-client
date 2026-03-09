"use client";

import { AppLocale } from "@/graphql/enums.graphql";
import { useLang } from "@/modules/lang/lang-context";
import { localeNames } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { zIndexes } from "@joy-one-client/config/layout";
import { Trans } from "@lingui/react/macro";
import { Anchor, Card, em, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLanguage, IconWorld } from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { Image } from "../image";
import { Modal } from "../modal/modal";

export const ButtonLanguage: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const lang = useLang();
  const color = useColor();

  const onSelect = async (locale?: AppLocale) => {
    lang.changeLocale(locale ?? "default");
    close();
  };

  return (
    <Fragment>
      <Anchor fz="xs" ta="center" c="gray" onClick={open}>
        <Group align="center" gap={0}>
          <ThemeIcon variant="transparent" color="gray">
            <IconWorld size={16} strokeWidth={1.5} />
          </ThemeIcon>
          {localeNames[lang.locale]}
        </Group>
      </Anchor>

      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        zIndex={zIndexes.requireAuth + 1}
      >
        <Stack p={8}>
          <Group justify="center" gap={5} mb={10}>
            <ThemeIcon variant="transparent">
              <IconWorld strokeWidth={1.5} />
            </ThemeIcon>

            <Title ta="center" fz={em(20)} fw={500} c={color("primary")}>
              <Trans>Select language</Trans>
            </Title>
          </Group>

          {Object.values(AppLocale).map((locale) => {
            return (
              <Card
                withBorder
                shadow="none"
                key={locale}
                p={10}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(locale)}
              >
                <Group gap={10}>
                  <Image src={`/lang/${locale}.png`} w={30} />
                  <Text fz={em(15)} fw={500}>
                    {localeNames[locale]}
                  </Text>
                </Group>
              </Card>
            );
          })}

          <Card withBorder p={10} style={{ cursor: "pointer" }} onClick={() => onSelect()}>
            <Group gap={10}>
              <ThemeIcon variant="transparent" color="dark">
                <IconLanguage strokeWidth={1.5} size={30} />
              </ThemeIcon>
              <Text fz={em(15)} fw={500}>
                <Trans>Use device language</Trans>
              </Text>
            </Group>
          </Card>
        </Stack>
      </Modal>
    </Fragment>
  );
};
