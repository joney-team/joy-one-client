import { useColor } from "@/modules/theme/use-color";
import { ModalTitle } from "@/components/modal-title";
import { WorkspaceBranchSelector } from "@/modules/workspace-branches/workspace-branch-selector";
import config from "@joy-one-client/config";
import { t } from "@/modules/lang/lang-service";
import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ActionIcon, CopyButton, Group, Input, InputWrapper, Stack, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCopy, IconCopyCheck, IconMessageUser, IconX } from "@tabler/icons-react";
import { FC, useState } from "react";

const ModalCustomerForm: FC = () => {
  const color = useColor();
  const workspace = useWorkspace();
  const [workspaceBranch, setWorkspaceBranch] = useState<Pick<WorkspaceBranchEntity, "_id" | "name"> | null>(null);
  const link = `${config.APP_URL}/customer-forms/new/${workspace.userMember.workspaceId}/${
    workspaceBranch?._id || "main"
  }`;

  return (
    <Stack>
      <WorkspaceBranchSelector
        value={
          workspaceBranch
            ? {
                _id: workspaceBranch._id,
                name: workspaceBranch.name,
              }
            : undefined
        }
        onSelect={(v) => {
          setWorkspaceBranch(v || null);
        }}
        renderTarget={(ctx) => {
          return (
            <InputWrapper onClick={ctx.toggle} label={t("workspace_branch")} w="100%">
              <Group gap={8}>
                <Input
                  flex={1}
                  className="AppSelectInput"
                  value={ctx.value?.name || t("main_workspace_branch")}
                  readOnly
                />
                {workspaceBranch && (
                  <Tooltip label={t("main_workspace_branch")}>
                    <ActionIcon
                      variant="outline"
                      pos="relative"
                      opacity={0.4}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setWorkspaceBranch(null);
                      }}
                      color="gray"
                      size="lg"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </InputWrapper>
          );
        }}
      />

      <CopyButton value={link}>
        {({ copied, copy }) => (
          <InputWrapper onClick={copy} label={t("customer_form_link")}>
            <Input
              className="AppSelectInput"
              value={link}
              readOnly
              rightSection={
                <ActionIcon component="div" variant="subtle" onClick={copy} color={color(copied ? "primary" : "color")}>
                  {copied ? <IconCopyCheck size={18} /> : <IconCopy size={18} />}
                </ActionIcon>
              }
            />
          </InputWrapper>
        )}
      </CopyButton>
    </Stack>
  );
};

export const OnModalCustomerForm: () => void = () => {
  return modals.open({
    modalId: "OpenCustomerFormModal",
    title: <ModalTitle title="link_form" icon={IconMessageUser} />,
    children: <ModalCustomerForm />,
  });
};
