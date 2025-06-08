import { Text, TextProps } from "@mantine/core";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";

interface TextEllipsisProps extends TextProps {}

export const TextEllipsis: FC<PropsWithChildren<TextEllipsisProps>> = (props) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (ref.current?.parentElement?.offsetWidth) {
      setMaxWidth(ref.current?.parentElement?.offsetWidth);
    }
  }, []);

  return (
    <Text ref={ref} truncate="end">
      {props.children}
    </Text>
  );
};
