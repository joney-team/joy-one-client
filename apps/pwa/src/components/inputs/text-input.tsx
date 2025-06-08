import { type FC } from "react";
import { TextInput as MantineTextInput, type TextInputProps as MantineTextInputProps } from "@mantine/core";

interface TextInputProps extends MantineTextInputProps {
  label?: MantineTextInputProps["label"];
  ref?: React.RefObject<HTMLInputElement>;
}

export const TextInput: FC<TextInputProps> = ({ value, ref, ...props }) => {
  return <MantineTextInput {...props} value={value ?? ""} ref={ref} />;
};
