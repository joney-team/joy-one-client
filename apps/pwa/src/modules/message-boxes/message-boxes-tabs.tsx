"use client";

import { useColor } from "@/modules/theme/use-color";
import { Circle } from "@/components/circle";
import { useMessageBoxes } from "./message-boxes-context";
import { messageBoxPlatformImages, messageBoxStatusColors } from "@/modules/message-boxes/message-boxes-service";
import { MessageBoxStatus } from "@/modules/message-boxes/message-boxes-types";
import { ActionIcon, Card, Group, Image, ScrollArea, Space, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { FC, useEffect, useRef, useState } from "react";

const height = 50;
const distanceOffset = 50;

export const MessageBoxTabs: FC = () => {
  const messageBoxes = useMessageBoxes();

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const color = useColor();
  const [isActiveLeftScroll, setIsActiveLeftScroll] = useState<boolean>(false);
  const [isActiveRightScroll, setIsActiveRightScroll] = useState<boolean>(false);

  const scrollLeft = () => {
    if (!viewportRef.current) return;
    const scrollDistance = viewportRef.current.clientWidth / 2;

    viewportRef.current.scrollTo({
      left: viewportRef.current.scrollLeft - scrollDistance,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    if (!viewportRef.current) return;
    const scrollDistance = viewportRef.current.clientWidth / 2;

    viewportRef.current.scrollTo({
      left: viewportRef.current.scrollLeft + scrollDistance,
      behavior: "smooth",
    });
  };

  const onScroll = () => {
    if (!viewportRef.current || !containerRef.current || !contentRef.current) return;

    if (viewportRef.current.scrollLeft > distanceOffset) {
      setIsActiveLeftScroll(true);
    } else {
      setIsActiveLeftScroll(false);
    }

    const isOverflowRight = contentRef.current.offsetWidth > containerRef.current!.offsetWidth;
    if (
      isOverflowRight &&
      viewportRef.current.scrollLeft + viewportRef.current.clientWidth <
        viewportRef.current.scrollWidth - distanceOffset
    ) {
      setIsActiveRightScroll(true);
    } else {
      setIsActiveRightScroll(false);
    }
  };

  useEffect(() => {
    onScroll();
  }, [messageBoxes.messageBox?._id, messageBoxes.messageBoxIds.length]);

  if (messageBoxes.messageBoxIds.length === 0) return null;

  return (
    <Group
      bg="var(--mantine-color-dark-light)"
      w="100%"
      style={{ height }}
      pos="relative"
      ref={containerRef}
      className="TabsMessageBoxes"
    >
      <ScrollArea scrollbars="x" viewportRef={viewportRef} type="never" onScrollPositionChange={onScroll}>
        <Group style={{ height }} align="center" wrap="nowrap" w="max-content" px={12} gap={12} ref={contentRef}>
          {messageBoxes.messageBoxIds.map((boxId) => {
            const box = messageBoxes.messageBoxes.find((box) => box._id === boxId);
            if (!box) return null;

            const isActive = messageBoxes.messageBox?._id === box._id;
            const statusColor = color(messageBoxStatusColors[box.status || MessageBoxStatus.CLOSED]);

            return (
              <Group id={`tab_${box._id}`} key={box._id}>
                <Card
                  className="clickable"
                  miw={200}
                  w="max-content"
                  px={4}
                  py={6}
                  shadow="none"
                  style={{
                    border: `1px solid var(--mantine-color-body)`,
                    borderColor: isActive ? color("primary") : "var(--mantine-color-body)",
                  }}
                  onClick={() => messageBoxes.open(box)}
                >
                  <Group gap={8} wrap="nowrap">
                    <Group gap={8} flex={1} pl={3} wrap="nowrap">
                      <Image src={messageBoxPlatformImages[box.platformType]} w={20} h={20} fit="contain" />
                      <Text fw={500} fz={13}>
                        {box.senderName}
                      </Text>
                    </Group>

                    <Group justify="end" gap={5} wrap="nowrap">
                      <Circle color={statusColor} size={8} />

                      <ActionIcon
                        component="div"
                        variant="subtle"
                        color="var(--mantine-color-dimmed)"
                        size="sm"
                        radius={5}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          messageBoxes.close(box);
                        }}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              </Group>
            );
          })}

          <Space w={1} h={1} />
        </Group>
      </ScrollArea>

      {isActiveLeftScroll && (
        <Group
          pos="absolute"
          top={0}
          left={0}
          px={8}
          style={{
            height,
          }}
        >
          <ActionIcon color="dark" onClick={scrollLeft} opacity={0.7}>
            <IconChevronLeft size={18} />
          </ActionIcon>
        </Group>
      )}

      {isActiveRightScroll && (
        <Group
          pos="absolute"
          top={0}
          right={0}
          px={8}
          style={{
            height,
          }}
        >
          <ActionIcon color="dark" onClick={scrollRight} opacity={0.7}>
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
      )}
    </Group>
  );
};
