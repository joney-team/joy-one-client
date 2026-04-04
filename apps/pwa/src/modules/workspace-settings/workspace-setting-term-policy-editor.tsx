"use client";

import { useRouter } from "@/hooks/use-router";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { ActionIcon, Card, Group, Stack, Title } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconChevronLeft } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { Editor } from "../../components/editor/editor";
import { useWorkspaceSetting } from "./hooks/use-workspace-setting";

interface WorkspaceSettingTermsPoliciesEditorProps {
  doc: `terms-of-service` | `privacy-policy`;
}

export const WorkspaceSettingTermsPoliciesEditor: FC<WorkspaceSettingTermsPoliciesEditorProps> = (
  props,
) => {
  const { updateWorkspaceSetting, workspaceSetting } = useWorkspaceSetting();
  const router = useRouter();

  const docNames = {
    "terms-of-service": () => t`Terms of service`,
    "privacy-policy": () => t`Privacy policy`,
  };

  const key = props.doc === "privacy-policy" ? "privacyPolicy" : "termsOfService";
  const [value, setValue] = useState<string | undefined>(
    (workspaceSetting ?? {})[key] ?? undefined,
  );
  const [debounced] = useDebouncedValue(value, 300);

  useEffect(() => {
    if (debounced !== (workspaceSetting as any)?.[key]) {
      updateWorkspaceSetting({
        [key]: debounced,
      }).catch(onError);
    }
  }, [debounced]);

  return (
    <Stack p="md">
      <Card withBorder className="WorkspaceTermsPoliciesEditor">
        <Stack>
          <Group justify="space-between">
            <Group flex={1}>
              <ActionIcon variant="subtle" color="dark" onClick={router.back}>
                <IconChevronLeft strokeWidth={1.5} />
              </ActionIcon>
            </Group>

            <Title flex={1} ta="center" size={25} fw={500}>
              {docNames[props.doc]()}
            </Title>
            <Group flex={1} />
          </Group>

          <Editor
            defaultValue={value}
            onChangeHTML={setValue}
            placeholder={t`Enter content`}
            delay={300}
          />
        </Stack>
      </Card>
    </Stack>
  );
};
