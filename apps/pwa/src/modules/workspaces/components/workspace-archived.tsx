"use client";

import { renderFileUrl } from "@/modules/files/files-utils";
import { WorkspaceDefaultRoleId } from "@/modules/workspace-roles/workspace-roles-types";
import { Trans } from "@lingui/react/macro";
import { Center, em, Stack, Text, Title } from "@mantine/core";
import { FC } from "react";
import { Button } from "../../../components/buttons/button";
import { Image } from "../../../components/image";
import { useWorkspace } from "../workspace-context";

export const WorkspaceArchived: FC = () => {
  const workspace = useWorkspace();
  const isOwner = workspace.userMember.roles.some((v) => v._id === WorkspaceDefaultRoleId.OWNER);
  const ownerName = "Owner";

  return (
    <Stack h="100dvh" justify="center">
      <Image
        src={
          workspace.userMember.workspace.logo
            ? renderFileUrl(workspace.userMember.workspace.logo)
            : "/symbol.png"
        }
        w={workspace.userMember.workspace.logo ? 130 : 50}
        radius={5}
      />

      <Stack gap={3}>
        <Title ta="center" order={3}>
          <Trans>Workspace archived</Trans>
        </Title>
        <Text fz={em(15)} ta="center">
          {isOwner || !ownerName ? (
            <Trans>
              This workspace is no longer active. Please contact <strong>{ownerName}</strong> to
              reactivate
            </Trans>
          ) : (
            <Trans>This workspace is no longer active. Please contact support to reactivate</Trans>
          )}
        </Text>

        <Center mt={10}>
          <Button miw={120} variant="subtle" onClick={() => workspace.leave()}>
            <Trans>Exit</Trans>
          </Button>
        </Center>
      </Stack>
    </Stack>
  );
};
