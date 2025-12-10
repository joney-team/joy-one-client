"use client";

import { classNames } from "@/utils/ui.utils";
import { Box, BoxProps } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { ClipboardEvent, FC, useEffect, useRef } from "react";
import { placeCaretAtEnd } from "./utils";

import styles from "./content-editable.module.css";

interface ContentEditableProps extends BoxProps {
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onEnter?: () => void;
  onBlur?: (value: string) => void;
  onEscape?: () => void;
  onClick?: () => void;
  autoFocus?: boolean;
  placeHolderFontSize?: number;
  fz?: number;
  fw?: number;
  onDoubleClick?: () => void;
}

export const ContentEditable: FC<ContentEditableProps> = ({
  placeholder,
  value,
  disabled = false,
  onChange,
  onEnter,
  onBlur,
  onEscape,
  onClick,
  autoFocus,
  placeHolderFontSize,
  onDoubleClick,
  ...props
}) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const fz = props.fz || 16;
  const forceUpdate = useForceUpdate();

  const handleOnChange = () => {
    if (!inputRef.current) return;
    if (onChange) {
      onChange(inputRef.current.textContent || "");
    } else {
      forceUpdate();
    }
  };

  const onInput = (_: React.FormEvent<HTMLDivElement>) => {
    if (!inputRef.current) return;
    handleOnChange();
  };

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!inputRef.current) return;
    const text = event.clipboardData?.getData("text");
    if (text) inputRef.current.textContent = `${inputRef.current?.textContent || ""}${text}`;
    placeCaretAtEnd(inputRef.current);

    handleOnChange();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { key } = e;

    // Prevent enter
    if (key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
      onEnter?.();
    }

    // Prevent formatting
    if (["b", "i", "u"].includes(key) && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
    }

    if (key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
      onEscape?.();
    }
  };

  const handleOnBlur = () => {
    if (!inputRef.current) return;
    onBlur?.(inputRef.current.textContent || "");
  };

  // Sync value
  useEffect(() => {
    if (
      typeof value !== "undefined" &&
      inputRef.current &&
      inputRef.current.textContent !== value
    ) {
      // Set value
      inputRef.current.textContent = value || "";
    }
  }, [value]);

  // Auto focus
  useEffect(() => {
    setTimeout(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current?.focus();
        placeCaretAtEnd(inputRef.current);
      }
    }, 100);
  }, [autoFocus, disabled]);

  // Sync value for development hot reload
  useEffect(() => {
    if (value !== inputRef.current?.textContent) {
      forceUpdate();
    }
  }, []);

  return (
    <Box
      className={classNames({
        [styles.ContentEditable]: true,
        [styles.isActive]: !disabled,
        [styles.isDoubleClickable]: !!onDoubleClick,
      })}
      mih={fz}
      style={{ position: "relative" }}
      flex={1}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {!!placeholder && !inputRef.current?.textContent && !value && (
        <Box
          fz={typeof placeHolderFontSize === "number" ? placeHolderFontSize : fz * 0.9}
          fw={400}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            zIndex: 0,
            padding: "0 0.5rem",
          }}
          opacity={0.5}
        >
          {placeholder}
        </Box>
      )}

      <Box
        className={styles.Input}
        ref={inputRef}
        contentEditable={!disabled}
        onInput={onInput}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        onBlur={handleOnBlur}
        w="100%"
        fz={fz}
        mih={fz}
        fw={props.fw}
        pos="relative"
        style={{
          zIndex: 1,
        }}
        {...props}
      />
    </Box>
  );
};
