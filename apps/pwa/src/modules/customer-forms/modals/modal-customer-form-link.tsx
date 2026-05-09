"use client";

import { ModalHead } from "@/components/modal/modal-head";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceBranchSelector } from "@/modules/workspace-branches/workspace-branch-selector";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import config from "@joy-one/config";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon, CopyButton, Group, Input, InputWrapper, Stack, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCopy, IconCopyCheck, IconMessageUser, IconX } from "@tabler/icons-react";
import { FC, useState } from "react";
import { WorkspaceBranchFragment } from "../../workspace-branches/graphql/fragmentWorkspaceBranch.graphql";
import { Trans } from "@lingui/react/macro";

const ModalCustomerFormLink: FC = () => {
  const { t } = useLingui();
  const color = useColor();
  const workspace = useWorkspace();
  const [workspaceBranch, setWorkspaceBranch] = useState<Pick<
    WorkspaceBranchFragment,
    "_id" | "name" | "hotline"
  > | null>(null);
  const link = `${config.APP_URL}/customer-forms/new/${workspace.member.workspaceId}/${
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
                hotline: workspaceBranch.hotline,
              }
            : undefined
        }
        onSelect={(v) => {
          setWorkspaceBranch(v || null);
        }}
        target={(ctx) => {
          return (
            <InputWrapper onClick={ctx.toggle} label={t`Branch`} w="100%">
              <Group gap={8}>
                <Input
                  flex={1}
                  className="AppSelectInput"
                  value={ctx.value?.name || t`Main office`}
                  readOnly
                />

                {workspaceBranch && (
                  <Tooltip label={t`Main office`}>
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
          <InputWrapper onClick={copy} label={t`Link customer form`}>
            <Input
              className="AppSelectInput"
              value={link}
              readOnly
              rightSection={
                <ActionIcon
                  component="div"
                  variant="subtle"
                  onClick={copy}
                  color={color(copied ? "primary" : "color")}
                >
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

export const OnModalCustomerFormLink: () => void = () => {
  return modals.open({
    modalId: "OpenCustomerFormLinkModal",
    withCloseButton: false,
    title: (
      <ModalHead
        onClose={() => modals.close("OpenCustomerFormLinkModal")}
        name={<Trans>Customer form link</Trans>}
        icon={IconMessageUser}
      />
    ),
    children: <ModalCustomerFormLink />,
  });
};
