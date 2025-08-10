import { Button } from "@/components/buttons/button";
import { CopyText } from "@/components/copy-text";
import { t } from "@/modules/lang/lang-service";
import { OnModalWorkspaceSdkForm } from "./modals/modal-workspace-sdk-form";
import { getWorkspaceSdks, removeWorkspaceSdk } from "./workspace-sdks-service";
import { WorkspaceSdkEntity } from "./workspace-sdks-types";
import { onArchive } from "@/utils/actions";
import { useList } from "@/components/list/use-list";
import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { IconPlus, IconPuzzle, IconTrash } from "@tabler/icons-react";
import { FC } from "react";

export const WorkspaceSdkList: FC = () => {
  const sdks = useList<WorkspaceSdkEntity>({
    fetch: (q) => getWorkspaceSdks(q),
  });

  return (
    <Stack p={16}>
      {sdks.isHasData &&
        sdks.data.map((sdk) => {
          return (
            <Card key={sdk._id} withBorder shadow="none">
              <Group justify="space-between">
                <Stack>
                  <Group>
                    <Text fw={600}>{t("name")}</Text>
                    <Text>{sdk.name}</Text>
                  </Group>
                  <CopyText text={sdk.key}>
                    <Group>
                      <Text fw={600}>Secret Key</Text>
                      <Text>••••••••••••••</Text>
                    </Group>
                  </CopyText>
                </Stack>

                <ActionIcon
                  variant="transparent"
                  c="gray"
                  onClick={() =>
                    onArchive({
                      name: `SDK ${sdk.name}`,
                      icon: IconPuzzle,
                      process: () =>
                        removeWorkspaceSdk(sdk._id).then(() =>
                          sdks.fetch(true, { isSilient: true })
                        ),
                    })
                  }
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </Card>
          );
        })}

      <Group justify="center">
        <Button
          variant="outline"
          leftIcon={IconPlus}
          onClick={() =>
            OnModalWorkspaceSdkForm({ onFinish: () => sdks.fetch(true, { isSilient: true }) })
          }
        >
          {t("create")} SDK
        </Button>
      </Group>
    </Stack>
  );
};
