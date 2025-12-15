import { ActionIcon, Group, GroupProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { type FC } from "react";

import styles from "./with-clearable.module.css";
import { classNames } from "@/utils/ui.utils";

interface WithClearableProps extends GroupProps {
  children: React.ReactNode;
  enabled?: boolean;
  onClear: () => void;
}

export const WithClearable: FC<WithClearableProps> = ({
  children,
  enabled = true,
  onClear,
  ...props
}) => {
  return (
    <Group
      justify="center"
      align="center"
      {...props}
      className={classNames(styles.WithClearable, props.className)}
      pos="relative"
    >
      {children}
      {enabled && (
        <ActionIcon
          className={styles.WithClearableButton}
          pos="absolute"
          variant="filled"
          color="gray"
          size={12}
          onClick={onClear}
        >
          <IconX size={8} strokeWidth={3} />
        </ActionIcon>
      )}
    </Group>
  );
};
