"use client";

import { Button } from "@/components/buttons/button";
import { CopyText } from "@/components/copy-text";
import { useList } from "@/components/list/use-rest-list";
import { onArchive } from "@/utils/actions";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import { IconPlus, IconPuzzle, IconTrash } from "@tabler/icons-react";
import { FC } from "react";
import { ModalWorkspaceSdkForm } from "./modals/modal-workspace-sdk-form";
import { getWorkspaceSdks, removeWorkspaceSdk } from "./workspace-sdks-service";
import { WorkspaceSdkEntity } from "./workspace-sdks-types";

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
                    <Text fw={600}>
                      <Trans>Name</Trans>
                    </Text>
                    <Text>{sdk.name}</Text>
                  </Group>
                  <CopyText text={sdk.key}>
                    <Group>
                      <Text fw={600}>
                        <Trans>Secret Key</Trans>
                      </Text>
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
                      process: async () => {
                        await removeWorkspaceSdk(sdk._id);
                        await sdks.fetch(true, { isSilient: true });
                      },
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
        <ModalWorkspaceSdkForm>
          {(open) => (
            <Button
              variant="outline"
              leftIcon={IconPlus}
              onClick={() => open({ onFinish: () => sdks.fetch(true, { isSilient: true }) })}
            >
              <Trans>Create SDK</Trans>
            </Button>
          )}
        </ModalWorkspaceSdkForm>
      </Group>
    </Stack>
  );
};
