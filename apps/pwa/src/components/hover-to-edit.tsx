"use client";

import { InputModalState, ModalInput } from "@/modals/modal-input";
import { ActionIcon, Group } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { FC, PropsWithChildren } from "react";
import { Hovered } from "./hovered";

interface HoverToEditProps {
  input: InputModalState;
  justify?: "start" | "end";
  disabled?: boolean;
}

export const HoverToEdit: FC<PropsWithChildren<HoverToEditProps>> = (props) => {
  return (
    <ModalInput>
      {(open) => (
        <Hovered disabled={props.disabled}>
          {(hover) => {
            return (
              <Group gap={5} justify={props.justify} ref={hover.ref} mih={28}>
                {props.children}

                {hover.hovered && !props.disabled && (
                  <ActionIcon variant="subtle" color="gray" onClick={() => open(props.input)}>
                    <IconPencil size={18} />
                  </ActionIcon>
                )}
              </Group>
            );
          }}
        </Hovered>
      )}
    </ModalInput>
  );
};
