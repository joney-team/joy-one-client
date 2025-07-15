import { renderLink } from "@/modules/files/files-utils";
import { t } from "@/modules/lang/lang-service";
import { WorkspaceSpecialRoleId } from "@/modules/workspace-roles/workspace-roles-types";
import { Center, em, Stack, Text, Title } from "@mantine/core";
import { FC } from "react";
import { Button } from "../../../components/buttons/button";
import { Image } from "../../../components/image";
import { useWorkspace } from "../workspace-context";

export const WorkspaceArchived: FC = () => {
  const workspace = useWorkspace();
  const isOwner = workspace.userMember.roles.some((v) => v._id === WorkspaceSpecialRoleId.OWNER);
  const ownerName = "Owner";

  return (
    <Stack h="100dvh" justify="center">
      <Image
        src={
          workspace.userMember.workspace.logo
            ? renderLink(workspace.userMember.workspace.logo)
            : "/symbol.png"
        }
        w={workspace.userMember.workspace.logo ? 130 : 50}
        radius={5}
      />

      <Stack gap={3}>
        <Title ta="center" order={3}>
          {t("workspace_archived")}
        </Title>
        <Text fz={em(15)} ta="center">
          {t(isOwner || !ownerName ? "workspace_archived_desc" : "workspace_archived_desc", {
            ownerName,
          })}
        </Text>

        <Center mt={10}>
          <Button miw={120} variant="subtle" onClick={() => workspace.leave()}>
            {t("exit")}
          </Button>
        </Center>
      </Stack>
    </Stack>
  );
};
