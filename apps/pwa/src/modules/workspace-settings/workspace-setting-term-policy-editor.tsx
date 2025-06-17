import { t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ActionIcon, Box, Card, Group, Stack, Title } from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { Editor } from "../../components/editor";
import { useDebouncedValue } from "@mantine/hooks";
import { IconChevronLeft } from "@tabler/icons-react";
import { useRouter } from "@/hooks/use-router";
import { onError } from "@/utils/exceptions.utils";

interface WorkspaceSettingTermsPoliciesEditorProps {
  doc: `terms-of-service` | `privacy-policy`;
}

export const WorkspaceSettingTermsPoliciesEditor: FC<WorkspaceSettingTermsPoliciesEditorProps> = (
  props
) => {
  const workspace = useWorkspace();
  const router = useRouter();

  const key = props.doc === "privacy-policy" ? "privacyPolicy" : "termsOfService";
  const [value, setValue] = useState((workspace.settings as any)?.[key]);
  const [debounced] = useDebouncedValue(value, 300);

  useEffect(() => {
    if (debounced !== (workspace.settings as any)?.[key]) {
      workspace
        .updateSettings({
          ...workspace.settings,
          [key]: debounced,
        })
        .catch(onError);
    }
  }, [debounced]);

  return (
    <Stack p={16}>
      <Card withBorder className="WorkspaceTermsPoliciesEditor">
        <Stack>
          <Group justify="space-between">
            <Group flex={1}>
              <ActionIcon variant="subtle" color="dark" onClick={router.back}>
                <IconChevronLeft strokeWidth={1.5} />
              </ActionIcon>
            </Group>

            <Title flex={1} ta="center" size={25} fw={500}>
              {t(props.doc)}
            </Title>
            <Group flex={1} />
          </Group>

          <Editor
            value={value}
            onChangeHTML={setValue}
            placeholder={t("type-content-placeholder")}
            delay={300}
          />
        </Stack>
      </Card>
    </Stack>
  );
};
