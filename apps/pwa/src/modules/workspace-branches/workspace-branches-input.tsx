"use client";

import { ActionIcon, Badge, Group, InputWrapper, InputWrapperProps } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { FC, useState } from "react";
import { Hovered } from "../../components/hovered";
import { WorkspaceBranchFragment } from "./graphql/fragmentWorkspaceBranch.graphql";
import { WorkspaceBranchesSelector } from "./workspace-branches-selector";

interface WorkspaceBranchesInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value: Pick<WorkspaceBranchFragment, "_id" | "name" | "hotline">[];
  onChange: (value: Pick<WorkspaceBranchFragment, "_id" | "name" | "hotline">[]) => void;
  disabled?: boolean;
  autoHide?: boolean;
}

export const WorkspaceBranchesInput: FC<WorkspaceBranchesInputProps> = (props) => {
  const { value, onChange, disabled, autoHide, ...rest } = props;
  const [branches, setBranches] =
    useState<Pick<WorkspaceBranchFragment, "_id" | "name" | "hotline">[]>(value);

  const onAdd = (branch: Pick<WorkspaceBranchFragment, "_id" | "name" | "hotline">) => {
    const isSelected = branches.some((v) => branch?._id === v._id);
    const workspaceBranches = isSelected
      ? branches.filter((v) => v._id !== branch._id)
      : [...branches, branch];
    setBranches(workspaceBranches);
    props.onChange(workspaceBranches);
  };

  const onRemove = (branchId: string) => {
    const workspaceBranches = branches.filter((v) => v._id !== branchId);
    setBranches(workspaceBranches);
    props.onChange(workspaceBranches);
  };

  return (
    <InputWrapper {...rest}>
      <WorkspaceBranchesSelector
        disabled={disabled}
        excludeIds={branches.map((v) => v._id)}
        onSelect={(branch) => {
          if (!branch) return;
          const isSelected = branches.some((v) => branch?._id === v._id);
          if (isSelected) {
            onRemove(branch._id);
          } else {
            onAdd(branch);
          }
        }}
        target={(ctx) => {
          return (
            <Hovered disabled={disabled}>
              {(hover) => {
                return (
                  <Group
                    ref={hover.ref}
                    flex={1}
                    gap={5}
                    onClick={ctx.toggle}
                    className={!disabled ? "clickable unselectable" : "unselectable"}
                  >
                    {branches.map((v) => {
                      return (
                        <Hovered key={v._id} disabled={disabled}>
                          {(hover) => {
                            return (
                              <Badge
                                ref={hover.ref}
                                variant="light"
                                color="gray"
                                pr={hover.hovered ? 0 : undefined}
                                rightSection={
                                  hover.hovered && (
                                    <ActionIcon
                                      component="div"
                                      radius={100}
                                      variant="subtle"
                                      color="gray"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(v._id);
                                      }}
                                    >
                                      <IconMinus size={13} style={{ marginLeft: -3 }} />
                                    </ActionIcon>
                                  )
                                }
                              >
                                {v.name}
                              </Badge>
                            );
                          }}
                        </Hovered>
                      );
                    })}

                    {!disabled && (
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        opacity={hover.hovered || (branches.length === 0 && !autoHide) ? 1 : 0}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                );
              }}
            </Hovered>
          );
        }}
      />
    </InputWrapper>
  );
};
