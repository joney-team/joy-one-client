import { t } from "@/modules/lang/lang-service";
import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { ActionIcon, Group, Input, InputWrapper, InputWrapperProps } from "@mantine/core";
import { IconChevronDown, IconX } from "@tabler/icons-react";
import { FC } from "react";
import { WorkspaceBranchSelector } from "./workspace-branch-selector";

interface WorkspaceBranchInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: Pick<WorkspaceBranchEntity, "_id" | "name" | "hotline"> | null;
  onChange: (value: Pick<WorkspaceBranchEntity, "_id" | "name" | "hotline"> | null) => void;
  disabled?: boolean;
  autoHide?: boolean;
}

export const WorkspaceBranchInput: FC<WorkspaceBranchInputProps> = (props) => {
  const { value, onChange, disabled, autoHide, ...rest } = props;

  return (
    <InputWrapper {...rest}>
      <WorkspaceBranchSelector
        disabled={disabled}
        excludeIds={value ? [value._id] : []}
        onSelect={(branch) => {
          if (!branch) return;
          props.onChange(branch);
        }}
        renderTarget={(ctx) => {
          return (
            <Group
              w="100%"
              onClick={ctx.toggle}
              style={{
                position: "relative",
              }}
            >
              <Input
                w="100%"
                className="AppSelectInput"
                placeholder={t("select_branch")}
                value={value?.name || ""}
                onChange={() => {}}
                readOnly
              />

              <Group
                pos="absolute"
                top={0}
                right={0}
                gap={0}
                px={5}
                style={{
                  zIndex: 2,
                  height: "100%",
                }}
              >
                {value && (
                  <ActionIcon
                    variant="subtle"
                    color="gray.5"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      props.onChange(null);
                    }}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                )}

                <ActionIcon variant="subtle" color="gray.5" size="sm">
                  <IconChevronDown size={16} />
                </ActionIcon>
              </Group>
            </Group>
          );
        }}
      />
    </InputWrapper>
  );
};
