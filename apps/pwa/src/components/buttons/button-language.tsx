"use client";

import { useLang } from "@/modules/lang/lang-context";
import { localeNames } from "@/modules/lang/lang-service";
import { ModalLanguage } from "@/modules/lang/modal-language";
import { Anchor, Group, ThemeIcon } from "@mantine/core";
import { IconWorld } from "@tabler/icons-react";
import { FC } from "react";

export const ButtonLanguage: FC = () => {
  const lang = useLang();

  return (
    <ModalLanguage>
      {(open) => {
        return (
          <Anchor fz="xs" ta="center" c="dark" onClick={open}>
            <Group align="center" gap={0}>
              <ThemeIcon variant="transparent" c="dark">
                <IconWorld size={16} strokeWidth={1.5} />
              </ThemeIcon>
              {localeNames[lang.locale]}
            </Group>
          </Anchor>
        );
      }}
    </ModalLanguage>
  );
};
