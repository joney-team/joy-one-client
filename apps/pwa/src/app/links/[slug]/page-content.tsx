"use client";

import { Image } from "@/components/image";
import { renderLink } from "@/modules/files/files-utils";
import { t } from "@/modules/lang/lang-service";
import type { LinkEntity } from "@/modules/links/links-types";
import { Button, em, Stack, Text, Title } from "@mantine/core";
import { FC, useEffect } from "react";

export const PageContent: FC<{ link: LinkEntity }> = (props) => {
  useEffect(() => {
    window.location.replace(props.link.url);
  }, []);

  return (
    <Stack className="Content" mih="100dvh" miw="100dvw" justify="center" align="center">
      <Image
        src={props.link.settings.appIcon ? renderLink(props.link.settings.appIcon) : "/symbol.png"}
        w={props.link.settings.appIcon ? 100 : 50}
        radius={5}
      />

      <Title fw={500} fz={em(25)} ta="center">
        {props.link.title}
      </Title>

      {props.link.description && <Text ta="center">{props.link.description}</Text>}

      <Button onClick={() => window.location.replace(props.link.url)}>{t("redirecting")}</Button>
    </Stack>
  );
};
