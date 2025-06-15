"use client";

import { Card, em, Group, InputWrapper, InputWrapperProps, Stack } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { FC, useEffect, useRef } from "react";
import SignaturePad from "react-signature-pad-wrapper";
import { Button } from "../buttons/button";

interface SignatureInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: File;
  onChange?: (value?: File) => void;
}

export const SignatureInput: FC<SignatureInputProps> = (props) => {
  const ref = useRef<SignaturePad>(null);
  let _props = { ...props } as any;

  delete _props.value;
  delete _props.onChange;

  useEffect(() => {
    ref.current?.on();

    ref.current?.instance.addEventListener("endStroke", () => {
      const data = ref.current?.toDataURL();
      if (ref.current?.isEmpty()) props.onChange?.(undefined);
      else if (data) props.onChange?.(base64ToFile(data, "signature.png"));
    });

    return () => {
      ref.current?.off();
    };
  }, []);

  return (
    <InputWrapper {..._props}>
      <Card withBorder shadow="none" p={0}>
        <Stack gap={3}>
          <SignaturePad ref={ref} redrawOnResize />

          <Group justify="center" mb={5}>
            <Button
              onClick={() => {
                ref.current?.clear();
                props.onChange?.(undefined);
              }}
              color="gray"
              variant="subtle"
              size="xs"
              fz={em(13)}
              leftIcon={IconRefresh}
            >
              Ký lại
            </Button>
          </Group>
        </Stack>
      </Card>
    </InputWrapper>
  );
};

export function base64ToFile(base64String: string, filename: string) {
  // Step 1: Remove the Base64 metadata (prefix)
  const base64Data = base64String.split(",")[1];

  // Step 2: Decode Base64 string to binary data
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  // Step 3: Convert binary data to Uint8Array
  const byteArray = new Uint8Array(byteNumbers);

  // Step 4: Create a Blob from the Uint8Array (MIME type as 'image/png')
  const blob = new Blob([byteArray], { type: "image/png" });

  // Step 5: Optionally, create a File from the Blob (optional, based on use case)
  const file = new File([blob], filename, { type: "image/png" });

  return file;
}
