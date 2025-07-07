"use client";

import { Checkbox as MantineCheckbox, CheckboxProps as MantineCheckboxProps } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";

const CheckboxIcon: MantineCheckboxProps["icon"] = ({ indeterminate, ...others }) => (
  <IconCircleFilled {...others} />
);

export const Checkbox = (props: MantineCheckboxProps) => {
  return (
    <MantineCheckbox
      className="clickable"
      icon={CheckboxIcon}
      variant="outline"
      styles={{
        ...props.styles,
        label: {
          cursor: "pointer",
          userSelect: "none",
        },
      }}
      {...props}
    />
  );
};
