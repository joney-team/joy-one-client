import config from "@joy-one-client/config";
import { useLang } from "@/lang/hooks";
import { Anchor, Button, Group, Image } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { FC } from "react";
import { ButtonLanguage } from "./language";

export const Header: FC = () => {
  const isMobile = useMediaQuery("(max-width: 1023px)", true);
  const { t } = useLang();

  return (
    <Group justify={isMobile ? "center" : "space-between"}>
      <Anchor component={Link} href="/">
        <Image
          src="/images/logo-horizontal.png"
          fit="contain"
          alt="JoyOne"
          height={isMobile ? 32 : 38}
          style={{ objectFit: "contain" }}
        />
      </Anchor>

      <Group visibleFrom="md" justify="flex-end" gap={30}>
        {/* <Anchor component={Link} href="/download" c="dark">
          Phiên bản máy tính
        </Anchor> */}

        {/* <Anchor href="#" c="dark">
          TÀI LIỆU
        </Anchor>

        <Anchor href="#" c="dark">
          TEAMMATES
        </Anchor> */}

        <Group>
          <Anchor href={config.APP_URL + "?authType=signin"}>
            <Button variant="outline" radius={100} tt="uppercase">
              {t("login")}
            </Button>
          </Anchor>

          <Anchor href={config.APP_URL + "?authType=register"}>
            <Button radius={100} tt="uppercase">
              {t("register")}
            </Button>
          </Anchor>

          <ButtonLanguage />
        </Group>
      </Group>
    </Group>
  );
};
