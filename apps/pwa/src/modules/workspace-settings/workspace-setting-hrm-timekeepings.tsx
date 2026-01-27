"use client";

import { Container } from "@/components/container";
import { CheckInLocationsInput } from "@/components/inputs/check-in-locations-input";
import { HrmTimekeepingsRules } from "@/graphql/types.graphql";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Card, InputWrapper, NumberInput, Stack, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { type FC } from "react";
import { useWorkspaceSetting } from "./hooks/useWorkspaceSetting";

export const WorkspaceSettingHrmTimekeepings: FC = () => {
  const { updateWorkspaceSetting, workspaceSetting } = useWorkspaceSetting();

  const onChange = useDebouncedCallback((values: HrmTimekeepingsRules) => {
    updateWorkspaceSetting({
      hrmTimeKeepingsRules: values,
    }).catch(onError);
  }, 300);

  const form = useForm<HrmTimekeepingsRules>({
    initialValues: workspaceSetting?.hrmTimeKeepingsRules ?? {
      __typename: "HrmTimekeepingsRules",
      acceptLatenessUpToMins: null,
      acceptOverTimeAtLeastMins: null,
      acceptLocations: [],
      requirePhoto: false,
    },
    validate: {},
    onValuesChange: (v) => onChange(v),
  });

  return (
    <Container p={16}>
      <Card shadow="xs">
        <Stack>
          <NumberInput
            label={t`Accept lateness up to ${"n"} minutes`}
            description={t`Leave blank if you want to deduct directly into working time`}
            {...form.getInputProps("acceptLatenessUpToMins")}
          />

          <NumberInput
            label={t`Start calculating OT from n (minutes) after the official working time`}
            description={t`Leave blank if you don't want to calculate overtime`}
            {...form.getInputProps("acceptOverTimeAtLeastMins")}
          />

          <InputWrapper label={t`On/Off settings`}>
            <Switch
              mt={8}
              label={t`Require photo when checking in/out`}
              defaultChecked={workspaceSetting?.hrmTimeKeepingsRules?.requirePhoto}
              {...form.getInputProps("requirePhoto")}
            />
          </InputWrapper>

          <CheckInLocationsInput
            label={t`Limit check-in position`}
            editable
            {...form.getInputProps("acceptLocations")}
          />
        </Stack>
      </Card>
    </Container>
  );
};
