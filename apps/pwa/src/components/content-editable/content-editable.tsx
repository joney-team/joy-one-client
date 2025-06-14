import { Box } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { ClipboardEvent, FC, useEffect, useRef } from "react";
import { placeCaretAtEnd } from "./utils";
import { classNames } from "@/utils/ui.utils";

import styles from "./content-editable.module.css";

interface ContentEditableProps {
  placeholder?: string;
  value?: string;
  fz?: number;
  fw?: number;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onEnter?: () => void;
  onBlur?: (value: string) => void;
  onClick?: () => void;
  autoFocus?: boolean;
  mt?: number;
  placeHolderFontSize?: number;
}

export const ContentEditable: FC<ContentEditableProps> = (props) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const fz = props.fz || 16;
  const disabled = typeof props.disabled !== "undefined" ? props.disabled : false;
  const forceUpdate = useForceUpdate();

  const onChange = () => {
    if (!inputRef.current) return;
    if (props.onChange) {
      props.onChange?.(inputRef.current.textContent || "");
    } else {
      forceUpdate();
    }
  };

  const onInput = (_: React.FormEvent<HTMLDivElement>) => {
    if (!inputRef.current) return;
    onChange();
  };

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!inputRef.current) return;
    const text = event.clipboardData?.getData("text");
    if (text) inputRef.current.textContent = `${inputRef.current?.textContent || ""}${text}`;
    placeCaretAtEnd(inputRef.current);

    onChange();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { key } = e;

    // Prevent enter
    if (key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
      props.onEnter?.();
    }

    // Prevent formatting
    if (["b", "i", "u"].includes(key) && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
    }
  };

  const onBlur = () => {
    if (!inputRef.current) return;
    props.onBlur?.(inputRef.current.textContent || "");
  };

  // Sync value
  useEffect(() => {
    if (
      typeof props.value !== "undefined" &&
      inputRef.current &&
      inputRef.current.textContent !== props.value
    ) {
      // Set value
      inputRef.current.textContent = props.value || "";
    }
  }, [props.value]);

  // Auto focus
  useEffect(() => {
    setTimeout(() => {
      if (props.autoFocus && inputRef.current) {
        inputRef.current?.focus();
        placeCaretAtEnd(inputRef.current);
      }
    }, 100);
  }, [props.autoFocus]);

  // Sync value for development hot reload
  useEffect(() => {
    if (props.value !== inputRef.current?.textContent) {
      forceUpdate();
    }
  }, []);

  return (
    <Box
      className={classNames({
        [styles.ContentEditable]: true,
        [styles.isActive]: !props.disabled,
      })}
      mih={fz}
      style={{ position: "relative" }}
      flex={1}
      onClick={props.onClick}
      mt={props.mt}
    >
      {!!props.placeholder && !inputRef.current?.textContent && !props.value && (
        <Box
          fz={typeof props.placeHolderFontSize === "number" ? props.placeHolderFontSize : fz * 0.9}
          fw={300}
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
          {props.placeholder}
        </Box>
      )}

      <Box
        className={styles.Input}
        ref={inputRef}
        contentEditable={!disabled}
        onInput={onInput}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        w="100%"
        fz={fz}
        mih={fz}
        style={{
          fontWeight: props.fw,
          position: "relative",
          zIndex: 1,
        }}
      />
    </Box>
  );
};
