import config from "@joy-one-client/config";
import { useLang } from "@/lang/hooks";
import { Anchor, Box, Button, Container, Group, Image, rem, Stack, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";

export const Footer: FC = () => {
  const { t } = useLang();

  return (
    <Box component="footer" style={{ background: "#0F1A30" }}>
      <Container size="lg" py={50}>
        <Stack align="center">
          <Anchor component={Link} href="/" mb={20}>
            <Image src="/images/logo-white.png" alt="JoyOne" w={200} />
          </Anchor>

          <Stack gap={8}>
            <Text ta="center" c="white" fz={rem(20)} fw={700}>
              {t("company_name")}
            </Text>

            <Text ta="center" c="white" fz={rem(15)}>
              {t("company_tax_code")}: 0317333858
            </Text>

            <Text ta="center" c="white" fz={rem(15)}>
              {t("company_address")}
            </Text>

            <Text ta="center" c="white" fz={rem(15)}>
              {t("phone_number")}:{" "}
              <Anchor c="white" href="tel:84918668140">
                0918 668 140
              </Anchor>
            </Text>

            <Text ta="center" c="white" fz={rem(15)}>
              {t("support_phone")}:{" "}
              <Anchor c="white" href="tel:0971153977">
                097 115 3977
              </Anchor>
            </Text>
          </Stack>

          <Anchor href={config.APP_URL + "?authType=register"}>
            <Button
              mt={30}
              size="lg"
              radius={100}
              rightSection={<IconChevronRight strokeWidth={1.5} />}
            >
              {t("try_now")}
            </Button>
          </Anchor>

          <Group mt={20}>
            <Anchor ta="center" c="white" component={Link} href="/privacy-policy">
              {t("privacy_policy")}
            </Anchor>

            <Anchor ta="center" c="white" component={Link} href="/terms-of-service">
              {t("terms_of_service")}
            </Anchor>
          </Group>

          <Stack gap={10} mt={20}>
            <Anchor href="tel:0971153977" ta="center" c="white" fz={rem(18)}>
              <strong>Hotline</strong> 097 115 3977
            </Anchor>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
