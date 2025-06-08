import { useColor } from "@/modules/theme/use-color";
import { Button } from "@/components/buttons/button";
import { t } from "@/modules/lang/lang-service";
import { TaskEntity } from "@/modules/tasks/tasks-types";
import { ActionIcon, Card, em, Group, Modal, Skeleton, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { IconCopy, IconShare2, IconX } from "@tabler/icons-react";
import { FC, useRef, useState } from "react";

interface ModalShareLinkState {
  task?: TaskEntity;
  url: string;
}

export let OnModalShareLink: (state: ModalShareLinkState) => void = () => {};

export const ModalSharelink: FC = () => {
  const state = useRef<ModalShareLinkState | null>(null);
  const clipboard = useClipboard({ timeout: 500 });

  const [opened, { open, close }] = useDisclosure(false);
  const [link, setLink] = useState<string>();
  const color = useColor();
  const themeColor = color("primary");

  OnModalShareLink = (s) => {
    state.current = s;
    setLink(s.url);
    open();
  };

  return (
    <Modal opened={opened} onClose={close} withCloseButton={false} zIndex={500} yOffset={100}>
      <Stack>
        <Group justify="space-between">
          <Group gap={10}>
            <ThemeIcon variant="filled" color={themeColor}>
              <IconShare2 size={20} />
            </ThemeIcon>

            <Title order={3} fz={em(15)} fw={500} c={themeColor}>
              {(function () {
                if (state.current?.task) return t("share_this_task");
                return t("share");
              })()}
            </Title>
          </Group>

          <Group justify="end">
            <ActionIcon variant="subtle" color="gray" onClick={close}>
              <IconX />
            </ActionIcon>
          </Group>
        </Group>

        {link ? (
          <>
            <Group justify="space-between" align="end">
              <Stack gap={3} flex={1}>
                <Text fz={em(12)} fw={500}>
                  {t("link")}
                </Text>
                <Card p={5} pl={10} withBorder shadow="none">
                  <Text truncate="end">{link}</Text>
                </Card>
              </Stack>

              <Group>
                <Button
                  color={themeColor}
                  leftIcon={IconCopy}
                  variant={clipboard.copied ? "filled" : "outline"}
                  onClick={() => clipboard.copy(link)}
                >
                  {t(clipboard.copied ? "copied" : "copy")}
                </Button>
              </Group>
            </Group>
          </>
        ) : (
          <>
            <Skeleton height={100} />
          </>
        )}
      </Stack>
    </Modal>
  );
};
