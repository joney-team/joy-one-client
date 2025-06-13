import config from "@joy-one-client/config";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
  Title,
  rem,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconChartBar, IconChevronRight, IconMessage, IconStack2 } from "@tabler/icons-react";
import { FC } from "react";
import { useLang } from "@/lang/hooks";

export default function Home() {
  const { t } = useLang();
  const isMobile = useMediaQuery("(max-width: 1023px)", true);

  return (
    <Box style={{ maxWidth: "100%", overflowX: "hidden" }}>
      <Box
        style={{
          backgroundImage: `url(/images/bg.png)`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Container size="lg" pt={20} pb={100}>
          <Stack>
            <Header />

            <Grid pt={isMobile ? 30 : 70} gutter={80}>
              <Grid.Col span={{ md: 12 }}>
                <Stack gap={30} align="center">
                  <Title ta="center" fz={rem(isMobile ? 45 : 55)} c="primary">
                    ENJOY <span style={{ fontWeight: 200 }}>WORK {isMobile ? <br /> : ""} IN </span>{" "}
                    ONE <span style={{ fontWeight: 200 }}>APP</span>
                  </Title>

                  <Stack gap={3}>
                    <Text ta="center" fz={rem(isMobile ? 15 : 22)}>
                      {t("intro_title")}
                    </Text>
                  </Stack>

                  <Group justify={isMobile ? "center" : undefined}>
                    <Anchor href={config.APP_URL + "?authType=register"}>
                      <Button
                        radius={100}
                        h={50}
                        w={220}
                        rightSection={<IconChevronRight strokeWidth={1.5} />}
                        tt="uppercase"
                      >
                        {t("start_now")}
                      </Button>
                    </Anchor>
                  </Group>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ md: 12 }}>
                <Center>
                  <Image w={600} maw="100%" src="/images/intro.png" alt="JoyOne" />
                </Center>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Container size="lg" py={100}>
        <Stack>
          <SessionTitle
            title={t("session_one_title")}
            description={
              <Text fz={rem(20)} ta="center">
                {t("session_one_desc")}
              </Text>
            }
          />

          <Grid gutter={100}>
            <Grid.Col span={{ md: 4 }}>
              <BenefitSession
                title={t("management")}
                image="/images/session-3.png"
                benefits={[
                  t("staff_management"),
                  t("tasks_management"),
                  t("report_management"),
                  t("time_tracking"),
                  t("product_management"),
                ]}
              />
            </Grid.Col>

            <Grid.Col span={{ md: 4 }}>
              <BenefitSession
                title={t("customer_access")}
                image="/images/session-1.png"
                benefits={[t("customer_access_desc"), t("customer_schedule")]}
              />
            </Grid.Col>

            <Grid.Col span={{ md: 4 }}>
              <BenefitSession
                title={t("customer_care")}
                image="/images/session-2.png"
                benefits={[
                  t("meta_messenger"),
                  t("zalo_oa"),
                  t("sms_marketing"),
                  t("email_marketing"),
                ]}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>

      <Box
        style={{
          backgroundImage: `url(/images/bg.png)`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Container size="xl" py={100}>
          <Stack>
            <SessionTitle
              title={t("interface_title")}
              description={
                <Text fz={rem(20)} ta="center">
                  {t("interface_desc")}
                </Text>
              }
            />

            <Stack gap={60}>
              <Grid align="center">
                <Grid.Col span={{ md: 7 }}>
                  <Image w="100%" maw="100%" src={`/images/demo-tasks.png`} alt="Joy One" />
                </Grid.Col>

                <Grid.Col span={{ md: 5 }} p={30}>
                  <Group>
                    <ThemeIcon size="xl" radius={100} variant="light">
                      <IconStack2 />
                    </ThemeIcon>
                    <Title order={2} fw={300}>
                      {t("task_management")}
                    </Title>
                  </Group>
                  <Stack gap={15} mt={20}>
                    <Text>{t("task_management_desc_1")}</Text>
                    <Text>{t("task_management_desc_2")}</Text>
                    <Text>{t("task_management_desc_3")}</Text>
                    <Text>{t("task_management_desc_4")}</Text>
                  </Stack>
                </Grid.Col>
              </Grid>

              <Grid align="center">
                <Grid.Col span={{ md: 5 }} p={30}>
                  <Group>
                    <ThemeIcon size="xl" radius={100} variant="light">
                      <IconChartBar />
                    </ThemeIcon>
                    <Title order={2} fw={300}>
                      {t("reports")}
                    </Title>
                  </Group>
                  <Stack gap={15} mt={20}>
                    <Text>{t("reports_desc_1")}</Text>
                    <Text>{t("reports_desc_2")}</Text>
                    <Text>{t("reports_desc_3")}</Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ md: 7 }} order={isMobile ? -1 : 0}>
                  <Image w="100%" maw="100%" src={`/images/demo-reports.png`} alt="Joy One" />
                </Grid.Col>
              </Grid>

              <Grid align="center">
                <Grid.Col span={{ md: 7 }}>
                  <Image w="100%" maw="100%" src={`/images/demo-messages.png`} alt="Joy One" />
                </Grid.Col>

                <Grid.Col span={{ md: 5 }} p={30}>
                  <Group>
                    <ThemeIcon size="xl" radius={100} variant="light">
                      <IconMessage />
                    </ThemeIcon>
                    <Title order={2} fw={300}>
                      {t("messages")}
                    </Title>
                  </Group>
                  <Stack gap={15} mt={20}>
                    <Text>{t("messages_desc_1")}</Text>
                    <Text>{t("messages_desc_2")}</Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

const SessionTitle: FC<{ title: any; description?: React.ReactNode }> = (props) => {
  return (
    <Stack align="center" mb={50} w="100%">
      <Title c="primary" fw={200} fz={rem(40)} tt="uppercase" ta="center">
        {props.title}
      </Title>
      {props.description && (
        <Center w="100%">
          <Box style={{ maxWidth: "100%", width: 650 }}>{props.description}</Box>
        </Center>
      )}
    </Stack>
  );
};

const BenefitSession: FC<{
  title: string;
  image: string;
  benefits: string[];
}> = (props) => {
  return (
    <Stack gap={40}>
      <Center>
        <Image maw="100%" w={200} src={props.image} alt={props.title} />
      </Center>
      <Stack gap={10}>
        <Title c="primary" ta="center" order={2}>
          {props.title}
        </Title>
        {props.benefits.map((benefit, index) => (
          <Text ta="center" key={index}>
            {benefit}
          </Text>
        ))}
      </Stack>
    </Stack>
  );
};
