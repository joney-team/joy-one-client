import { useColor } from "@/modules/theme/use-color";
import { Image } from "@/components/image";
import { useLang } from "@/modules/lang/lang-context";
import { localeNames, tl } from "@/modules/lang/lang-service";
import { Locale } from "@/modules/lang/lang-types";
import { Card, em, Group, Modal, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLanguage, IconWorld } from "@tabler/icons-react";
import { FC } from "react";

export let OnModalLang = () => {};

export const ModalLang: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();
  const lang = useLang();

  OnModalLang = () => open();

  const onSelect = async (locale?: Locale) => {
    close();
    lang.setLocale(locale);
  };

  return (
    <Modal opened={opened} onClose={close} withCloseButton={false}>
      <Stack>
        <Group justify="center" gap={5}>
          <ThemeIcon variant="transparent">
            <IconWorld strokeWidth={1.5} />
          </ThemeIcon>

          <Title ta="center" fz={em(18)} fw={500} c={color("primary")}>
            {tl("select_language")}
          </Title>
        </Group>

        {Object.values(Locale).map((locale) => {
          const isSelected = lang.locale === locale;

          return (
            <Card
              withBorder
              shadow="none"
              key={locale}
              p={10}
              style={{ cursor: "pointer", borderColor: isSelected ? color("primary") : undefined }}
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
          onClick={() => onSelect()}
        >
          <Group gap={10}>
            <ThemeIcon variant="transparent" color="dark">
              <IconLanguage strokeWidth={1.5} size={30} />
            </ThemeIcon>
            <Text fz={em(15)} fw={500}>
              {tl("use_device_language")}
            </Text>
          </Group>
        </Card>
      </Stack>
    </Modal>
  );
};
