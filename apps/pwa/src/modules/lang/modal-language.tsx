"use client";

import { Image } from "@/components/image";
import { AppLocale } from "@/graphql/enums.graphql";
import { useLang } from "@/modules/lang/lang-context";
import { localeNames } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { onActionLoad } from "@/utils/actions";
import { Trans } from "@lingui/react/macro";
import { Card, em, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLanguage, IconWorld } from "@tabler/icons-react";
import { FC, Fragment, ReactNode } from "react";

export const ModalLang: FC<{
  children: (open: () => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();
  const lang = useLang();

  const onSelect = async (locale: AppLocale | "default") => {
    close();
    onActionLoad({
      name: <Trans>Changing language</Trans>,
      process: async () => {
        await lang.changeLocale(locale);
      },
    });
  };

  return (
    <Fragment>
      {children(open)}
      <Modal opened={opened} onClose={close} withCloseButton={false}>
        <Stack>
          <Group justify="center" gap={5}>
            <ThemeIcon variant="transparent">
              <IconWorld strokeWidth={1.5} />
            </ThemeIcon>

            <Title ta="center" fz={em(18)} fw={500} c={color("primary")}>
              <Trans>Select language</Trans>
            </Title>
          </Group>

          {Object.values(AppLocale).map((locale) => {
            const isSelected = lang.locale === locale;

            return (
              <Card
                withBorder
                shadow="none"
                key={locale}
                p={10}
                style={{
                  cursor: "pointer",
                  borderColor: isSelected ? color("primary") : undefined,
                }}
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

          <Card
            withBorder
            shadow="none"
            p={10}
            style={{ cursor: "pointer", borderColor: !lang.locale ? color("primary") : undefined }}
            onClick={() => onSelect("default")}
          >
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
