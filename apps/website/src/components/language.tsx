import { localeNames, useLang } from '@/lang/hooks';
import { Locale } from '@/lang/types';
import { Anchor, Card, em, Group, Image, Modal, Stack, Text, ThemeIcon, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLanguage, IconWorld } from '@tabler/icons-react';
import { FC } from 'react';

export const ButtonLanguage: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const { t, locale, switchLocale } = useLang();

  const onSelect = async (locale?: Locale) => {
    close();
    switchLocale(locale);
  }

  return (
    <>
      <Tooltip label={t('change_language')}>
        <Anchor fz={em(13)} ta="center" c="gray" onClick={open}>
          <Image src={`/lang/${locale}.png`} w={36} h={36} />
        </Anchor>
      </Tooltip>

      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
      >
        <Stack>
          <Group justify='center' gap={5}>
            <ThemeIcon variant='transparent'>
              <IconWorld strokeWidth={1.5} />
            </ThemeIcon>

            <Title ta="center" fz={em(20)} fw={400}>{t('select_language')}</Title>
          </Group>

          {Object.values(Locale).map((locale) => {
            return <Card
              withBorder
              key={locale}
              p={10}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(locale)}
            >
              <Group gap={10}>
                <Image src={`/lang/${locale}.png`} w={30} />
                <Text fz={em(15)} fw={500}>{localeNames[locale]}</Text>
              </Group>
            </Card>
          })}

          <Card
            withBorder
            p={10}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect()}
          >
            <Group gap={10}>
              <ThemeIcon variant='transparent' color="dark">
                <IconLanguage strokeWidth={1.5} size={30} />
              </ThemeIcon>
              <Text fz={em(15)} fw={500}>{t("use_device_language")}</Text>
            </Group>
          </Card>
        </Stack>
      </Modal>
    </>
  )
}