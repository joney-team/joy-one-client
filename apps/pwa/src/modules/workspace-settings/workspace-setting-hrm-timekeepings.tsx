import { type FC } from "react";
import { Container } from "@/components/container";
import { CheckInLocationsInput } from "@/components/inputs/check-in-locations-input";
import { HrmTimekeepingsRules } from "@/modules/hrm-timekeepings/hrm-timekeepings-types";
import { tl } from "@/modules/lang/lang-service";
import { setWorkspaceSettings } from "@/modules/workspace-settings/workspace-settings-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { Card, InputWrapper, NumberInput, Stack, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";

export const WorkspaceSettingHrmTimekeepings: FC = () => {
  const workspace = useWorkspace();

  const onChange = useDebouncedCallback((values: HrmTimekeepingsRules) => {
    setWorkspaceSettings({
      ...workspace.settings,
      hrmTimeKeepingsRules: values,
    }).catch(onError);
  }, 300);

  const form = useForm<HrmTimekeepingsRules>({
    initialValues: workspace.settings.hrmTimeKeepingsRules || {
      acceptLocations: [],
    },
    validate: {},
    onValuesChange: (v) => onChange(v),
  });

  return (
    <Container p={16}>
      <Card shadow="xs">
        <Stack>
          <NumberInput
            label={tl("acceptLatenessUpToMins", { mins: "n" })}
            description={tl("acceptLatenessUpToMinsDesc")}
            {...form.getInputProps("acceptLatenessUpToMins")}
          />

          <NumberInput
            label={tl("acceptOverTimeAtLeastMins")}
            description={tl("acceptOverTimeAtLeastMinsDesc")}
            {...form.getInputProps("acceptOverTimeAtLeastMins")}
          />

          <InputWrapper label={tl("on_off_settings")}>
            <Switch
              mt={8}
              label={tl("hrm_timekeepings_require_photo")}
              defaultChecked={workspace.settings.hrmTimeKeepingsRules?.requirePhoto}
              {...form.getInputProps("requirePhoto")}
            />
          </InputWrapper>

          <CheckInLocationsInput
            label={tl("limit_check_in_position")}
            editable
            {...form.getInputProps("acceptLocations")}
          />
        </Stack>
      </Card>
    </Container>
  );
};
