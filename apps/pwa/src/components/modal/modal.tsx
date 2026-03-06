"use client";

import { useEscape } from "@/hooks/use-escape";
import { useLayout } from "@/layout/layout-context";
import { Modal as MantineModal, ModalProps as MantineModalProps } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { FC, ReactNode, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { ModalHead } from "./modal-head";

export interface ModalProps extends MantineModalProps {
  id?: string;
  icon?: Icon;
  name?: ReactNode;
  color?: string;
  isFullscreenOnMobile?: boolean;
}

export const Modal: FC<ModalProps> = ({
  id,
  icon,
  name,
  isFullscreenOnMobile,
  color,
  ...props
}) => {
  const layout = useLayout();

  const modalId = useMemo(() => {
    return id ?? uuidv4();
  }, [id]);

  const isFullScreen = useMemo(() => {
    if (isFullscreenOnMobile && layout.view === "mobile") {
      return true;
    }

    return props.fullScreen;
  }, [isFullscreenOnMobile, props.fullScreen, layout.view]);

  useEscape({
    id: modalId,
    onEscape: () => props.onClose?.(),
    active: props.opened && props.closeOnEscape !== false,
  });

  useEffect(() => {
    if (props.opened) {
      const lockedBy = document.body.getAttribute("scroll-lock-by");
      if (lockedBy) return;

      document.body.setAttribute("scroll-lock", "true");
      document.body.setAttribute("scroll-lock-by", modalId);
    }

    return () => {
      const lockedBy = document.body.getAttribute("scroll-lock-by");

      if (lockedBy === modalId) {
        document.body.removeAttribute("scroll-lock");
        document.body.removeAttribute("scroll-lock-by");
      }
    };
  }, [props.opened, modalId]);

  return (
    <MantineModal
      {...props}
      closeOnEscape={false}
      withCloseButton={false}
      removeScrollProps={{ enabled: false }}
      fullScreen={isFullScreen}
      title={
        name ? (
          <ModalHead color={color} name={name} icon={icon} onClose={props.onClose} />
        ) : (
          props.title
        )
      }
    />
  );
};
