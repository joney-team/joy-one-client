"use client";

import { enumColumn } from "@/components/list/columns/enum-column";
import { List } from "@/components/list/list";
import { Badge, Group, Stack } from "@mantine/core";
import { IconEdit, IconForms } from "@tabler/icons-react";
import { type FC } from "react";
import { EventType } from "../events/event-types";
import { CustomFieldEntity, CustomFieldType } from "./custom-field-types";
import { OnModalCustomField } from "./modals/modal-custom-field";
import { customFieldTypes } from "./custom-field-constants";
import { appEntities } from "@/constant";

export const CustomFieldList: FC = () => {
  return (
    <Stack p={16}>
      <List<CustomFieldEntity>
        id="custom-fields"
        name="workspaceSettingsCustomFields"
        icon={IconForms}
        route="/custom-fields"
        columns={{
          label: {},
          description: {},
          key: { name: "Key", filter: { text: true } },
          type: enumColumn({
            options: Object.values(CustomFieldType).map((type) => ({
              label: customFieldTypes[type].label(),
              value: type,
            })),
          }),
          entities: {
            name: "apply",
            render: ({ value }) => {
              return (
                <Group>
                  {value?.map((entity) => (
                    <Badge variant="light" key={entity} color="gray">
                      {appEntities[entity].name()}
                    </Badge>
                  ))}
                </Group>
              );
            },
          },
        }}
        actions={[
          {
            label: "edit",
            icon: IconEdit,
            onClick: (data) => {
              OnModalCustomField({ customField: data });
            },
          },
        ]}
        events={[
          EventType.CUSTOM_FIELDS_NEW,
          EventType.CUSTOM_FIELDS_UPDATED,
          EventType.CUSTOM_FIELDS_REMOVED,
        ]}
        creatable={{
          onCreate: () => OnModalCustomField(),
        }}
      />
    </Stack>
  );
};
