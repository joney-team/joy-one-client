"use client";

import { InputModalProps, OnModalInput } from "@/modals/modal-input";
import { FC, PropsWithChildren } from "react";
import { Hovered } from "./hovered";
import { ActionIcon, Group } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";

interface HoverToEditProps {
  input: InputModalProps;
  justify?: "start" | "end";
  disabled?: boolean;
}

export const HoverToEdit: FC<PropsWithChildren<HoverToEditProps>> = (props) => {
  return (
    <Hovered disabled={props.disabled}>
      {(hover) => {
        return (
          <Group gap={5} justify={props.justify} ref={hover.ref} mih={28}>
            {props.children}

            {hover.hovered && !props.disabled && (
              <ActionIcon variant="subtle" color="gray" onClick={() => OnModalInput(props.input)}>
                <IconPencil size={18} />
              </ActionIcon>
            )}
          </Group>
        );
      }}
    </Hovered>
  );
};
