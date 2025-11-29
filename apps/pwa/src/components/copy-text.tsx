"use client";

import { ActionIcon, CopyButton, Group, Text, TextProps, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { FC, PropsWithChildren, ReactNode } from "react";

export interface CopyTextProps extends TextProps {
  text: string | number;
  renderText?: () => string | ReactNode;
  empty?: string;
}

export const CopyText: FC<PropsWithChildren<CopyTextProps>> = ({
  text,
  renderText,
  empty,
  ...props
}) => {
  return (
    <CopyButton value={text.toString()}>
      {({ copied, copy }) => (
        <Group gap={3} onClick={copy} style={{ maxWidth: "100%" }} wrap="nowrap">
          {props.children ? (
            props.children
          ) : (
            <Tooltip label={text.toString()} disabled={!text}>
              <Text {...props}>{renderText ? renderText() : text || empty || ""}</Text>
            </Tooltip>
          )}

          <ActionIcon bg="transparent" onClick={copy} variant="white">
            {copied ? <IconCheck size={18} /> : <IconCopy color="gray" size={18} />}
          </ActionIcon>
        </Group>
      )}
    </CopyButton>
  );
};
