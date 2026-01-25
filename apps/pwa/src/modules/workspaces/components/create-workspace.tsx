"use client";

import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { WorkspaceType } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { useLang } from "@/modules/lang/lang-context";
import { LocationEntity } from "@/modules/locations/locations-types";
import { WorkspaceTypeItem } from "@/modules/workspaces/components/workpsace-type-item";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { String } from "@/utils/string.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Anchor,
  Group,
  InputWrapper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  em,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCheck, IconInfoCircle } from "@tabler/icons-react";
import { ChangeEventHandler, FC, useState } from "react";
import { api } from "../../apis";
import { workspaceTypes } from "../workspace-constants";

export const CreateWorkspace: FC<{ onDone: () => void }> = (props) => {
  const workspace = useWorkspace();
  const lang = useLang();
  const layout = useLayout();
  const { t } = useLingui();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      logo: "",
      name: "",
      location: {} as LocationEntity,
      hotline: "",
      phone: "",
      code: "",
      type: Object.values(WorkspaceType)[0],
      locale: lang.locale,
    },
    validate: {
      name: (value: string) => {
        if (!value) return t`Must be provided`;
      },
      code: (value: string) => {
        if (!value) return t`Must be provided`;
        if (!/^[A-Z0-9]+$/.test(value)) return t`Invalid workspace code`;
      },
      type: (value: WorkspaceType) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    await workspace
      .create(values)
      .then(props.onDone)
      .catch(onError)
      .finally(() => setIsSubmitting(false));
  });

  const onAutoFillCode = useDebouncedCallback((name: string) => {
    if (name.length === 0) return;

    api
      .post(`/workspaces/random-code`, { name })
      .then((res) => form.setFieldValue("code", res.result))
      .catch(() => false);
  }, 300);

  const onChangeName: ChangeEventHandler<HTMLInputElement> = (e) => {
    const name = e.target.value;
    form.setFieldValue("name", name);
    onAutoFillCode(name);
  };

  return (
    <Stack mih={layout.height} justify="center" gap={20} py={16}>
      <Image src="/images/workspace.png" w={250} />

      <Stack gap={3}>
        <Title ta="center" fw={500} fz={30}>
          <Trans>Create</Trans> Workspace
        </Title>
        <Text ta="center" fz="xs" c="gray">
          <Trans>Company</Trans> / <Trans>Company branch</Trans>
        </Text>
      </Stack>

      <Stack>
        <Group align="start">
          <TextInput
            flex={1}
            label={<Trans>Name</Trans>}
            placeholder="Gold Dental"
            {...form.getInputProps("name")}
            onChange={onChangeName}
          />

          <TextInput
            label={
              <Group gap={5}>
                <Trans>Code</Trans>

                <Tooltip
                  label={
                    <Trans>
                      The Workspace code is unique and used to quickly identify the Workspace and
                      data related to the Workspace
                    </Trans>
                  }
                >
                  <IconInfoCircle size={16} strokeWidth={1.5} />
                </Tooltip>
              </Group>
            }
            placeholder="GDEN"
            styles={{
              label: {
                fontSize: 11,
              },
              description: {
                fontSize: em(12),
              },
            }}
            {...form.getInputProps("code")}
            value={form.values.code.toUpperCase()}
            onChange={(e) =>
              form.setFieldValue(
                "code",
                String.toSlug(e.currentTarget.value).split("-")[0].toUpperCase()
              )
            }
          />
        </Group>

        <InputWrapper
          label={<Trans>Workspace type</Trans>}
          description={
            <Trans>
              For each type of Workspace, Joy One will arrange the interface and features to fit.
              But you can customize them in Settings Menu
            </Trans>
          }
          {...form.getInputProps("type")}
        >
          <Group pt={10} className="unselectable">
            {Object.values(WorkspaceType).map((type) => {
              return (
                <WorkspaceTypeItem
                  key={type}
                  icon={workspaceTypes[type].icon}
                  label={t(workspaceTypes[type].name)}
                  isActive={form.values.type === type}
                  onClick={() => form.setFieldValue("type", type)}
                />
              );
            })}
          </Group>
        </InputWrapper>
      </Stack>

      <Stack align="center" pt="sm">
        <Button
          size="md"
          onClick={() => onSubmit()}
          loading={isSubmitting}
          leftIcon={IconCheck}
          radius={100}
        >
          <Trans>Complete</Trans>
        </Button>

        <Anchor onClick={props.onDone} fz="xs" fw={700} c="gray">
          <Trans>Exit</Trans>
        </Anchor>
      </Stack>
    </Stack>
  );
};
