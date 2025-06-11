import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  Anchor,
  Box,
  Center,
  Container,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
  Title,
  em,
} from "@mantine/core";
import { IconDeviceDesktop } from "@tabler/icons-react";
import { NextPage } from "next";
import { Fragment } from "react";

const Page: NextPage = () => {
  return (
    <Fragment>
      <Box style={{ maxWidth: "100%", overflowX: "hidden" }}>
        <Box
          style={{
            backgroundImage: `url(/images/bg.png)`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Container size="lg" py={60} pb={100}>
            <Stack>
              <Header />

              <Stack py={100}>
                <Stack gap={20}>
                  <Center>
                    <ThemeIcon size={120} radius={100}>
                      <IconDeviceDesktop size={80} strokeWidth={1} />
                    </ThemeIcon>
                  </Center>
                  <Title fz={em(30)} fw={500} tt="uppercase" c="primary" ta="center">
                    Phần Mềm Trên Máy Tính
                  </Title>
                  <Text ta="center">Bạn vui lòng lựa chọn hệ điều hành phù hợp</Text>
                </Stack>

                <Group justify="center" gap={30} mt={15}>
                  <Anchor href="https://api.joyone.vn/packages/JoyOne-1.0.0-arm64.dmg">
                    <Image src="/images/download-mac.svg" alt="JoyOne" height={50} />
                  </Anchor>

                  <Anchor href="https://api.joyone.vn/packages/JoyOne-win32-x64.zip">
                    <Image src="/images/download-windows.svg" alt="JoyOne" height={50} />
                  </Anchor>

                  <Anchor href="https://api.joyone.vn/packages/JoyOne-linux-arm64.zip">
                    <Image src="/images/download-linux.svg" alt="JoyOne" height={50} />
                  </Anchor>
                </Group>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />
    </Fragment>
  );
};

export default Page;
