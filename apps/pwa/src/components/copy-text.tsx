import { ActionIcon, CopyButton, Group, MantineSize, StyleProp, Text } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { FontWeight } from "next/dist/compiled/@vercel/og/satori";
import { FC, PropsWithChildren } from "react";

export const CopyText: FC<
  PropsWithChildren<{
    text: string;
    empty?: string;
    fz?: StyleProp<number | MantineSize | (string & {})>;
    fw?: StyleProp<FontWeight>;
  }>
> = (props) => {
  return (
    <CopyButton value={props.text}>
      {({ copied, copy }) => (
        <Group gap={3} onClick={copy} style={{ maxWidth: "100%" }} wrap="nowrap">
          {props.children ? (
            props.children
          ) : (
            <Text fw={props.fw} fz={props.fz}>
              {props.text || props.empty || ""}
            </Text>
          )}

          <ActionIcon bg="transparent" onClick={copy} variant="white">
            {copied ? <IconCheck size={18} /> : <IconCopy color="gray" size={18} />}
          </ActionIcon>
        </Group>
      )}
    </CopyButton>
  );
};
