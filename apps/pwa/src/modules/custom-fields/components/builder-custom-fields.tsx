"use client";

import { useRestQuery } from "@/modules/apis/use-rest-query";
import { EventType } from "@/modules/events/event-types";
import { AppEntity, ResponseList } from "@/types";
import { t } from "@lingui/core/macro";
import { Card, InputWrapper, SimpleGrid, Switch } from "@mantine/core";
import { FC, Fragment, ReactNode } from "react";
import { CustomField, CustomFieldEntity, CustomFieldType } from "../custom-field-types";
import { customFieldInputs } from "../inputs/_index";

export interface CustomFieldInputProps {
  customField: CustomFieldEntity;
  value?: any;
  onChange: (value: any) => void;
}

export interface BuilderCustomFieldsProps {
  before?: ReactNode;
  entity: AppEntity;
  value?: CustomField[];
  onChange: (value: CustomField[]) => void;
}

export const BuilderCustomFields: FC<BuilderCustomFieldsProps> = (props) => {
  const customFields = useRestQuery<ResponseList<CustomFieldEntity>>({
    route: "/custom-fields",
    params: {
      entities: [props.entity],
      getAll: true,
    },
    refetchEvents: [
      EventType.CUSTOM_FIELDS_NEW,
      EventType.CUSTOM_FIELDS_UPDATED,
      EventType.CUSTOM_FIELDS_REMOVED,
    ],
  });

  const values: CustomField[] = (customFields.data?.data || []).map((customField) => {
    const customFieldValue = props.value?.find((v) => v.customFieldId === customField._id);

    return {
      customFieldId: customField._id,
      value: customFieldValue?.value,
      key: customFieldValue?.key ?? null,
      type: customField.type,
      config: customField.config,
    };
  });

  const sortedCustomFields = customFields.data?.data?.sort((a, b) => b.order - a.order) || [];
  const commonCustomFields = sortedCustomFields.filter((v) => v.type !== CustomFieldType.SWITCH);
  const switchCustomFields = sortedCustomFields.filter((v) => v.type === CustomFieldType.SWITCH);

  return (
    <Fragment>
      {commonCustomFields.length > 0 && props.before}

      {commonCustomFields.map((customField) => {
        const Input = customFieldInputs[customField.type];
        const customFieldValue = values.find((v) => v.customFieldId === customField._id);

        if (!Input) {
          return null;
        }

        return (
          <Input
            key={customField._id}
            customField={customField}
            value={customFieldValue?.value}
            onChange={(value) => {
              props.onChange(
                values.map((v) =>
                  v.customFieldId === customField._id
                    ? { ...v, type: customField.type, config: customField.config, value }
                    : v
                )
              );
            }}
          />
        );
      })}

      {switchCustomFields.length > 0 && (
        <InputWrapper label={t`Setup`}>
          <Card shadow="none" withBorder p={12}>
            <SimpleGrid>
              {switchCustomFields.map((customField) => {
                const Input = customFieldInputs[customField.type];
                const customFieldValue = values.find((v) => v.customFieldId === customField._id);

                if (!Input) {
                  return null;
                }

                return (
                  <Switch
                    key={customField._id}
                    label={customField.label}
                    checked={customFieldValue?.value}
                    onChange={(event) => {
                      props.onChange(
                        values.map((v) =>
                          v.customFieldId === customField._id
                            ? { ...v, value: event.target.checked }
                            : v
                        )
                      );
                    }}
                  />
                );
              })}
            </SimpleGrid>
          </Card>
        </InputWrapper>
      )}
    </Fragment>
  );
};
