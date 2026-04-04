"use client";

import { CustomFieldType, EventType } from "@/graphql/enums.graphql";
import { CustomFieldValue } from "@/graphql/types.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { AppEntity } from "@/types";
import { useQuery } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Card, InputWrapper, SimpleGrid, Switch } from "@mantine/core";
import { FC, Fragment, ReactNode } from "react";
import { CustomFieldFragment } from "../graphql/fragmentCustomField.graphql";
import GetCustomFieldsDocument from "../graphql/getCustomFields.graphql";
import { customFieldInputs } from "../inputs/_index";

export interface CustomFieldInputProps {
  customField: CustomFieldFragment;
  value?: any;
  onChange: (value: any) => void;
}

export interface BuilderCustomFieldsProps {
  before?: ReactNode;
  entity: AppEntity;
  value?: CustomFieldValue[];
  onChange: (value: CustomFieldValue[]) => void;
}

export const BuilderCustomFields: FC<BuilderCustomFieldsProps> = (props) => {
  const { data: customFields, refetch } = useQuery(GetCustomFieldsDocument, {
    variables: {
      query: {
        entities: [props.entity],
      },
    },
  });

  useEventsListener(
    [EventType.CustomFieldsNew, EventType.CustomFieldsUpdated, EventType.CustomFieldsRemoved],
    () => {
      refetch();
    },
  );

  const values: CustomFieldValue[] = (customFields?.list?.results || []).map((customField) => {
    const customFieldValue = props.value?.find((v) => v.customFieldId === customField._id);

    return {
      __typename: "CustomFieldValue",
      customFieldId: customField._id,
      value: customFieldValue?.value,
      key: customFieldValue?.key ?? null,
      type: customField.type,
      config: customField.config,
    };
  });

  const sortedCustomFields = (customFields?.list?.results || []).sort((a, b) => b.order - a.order);
  const commonCustomFields = sortedCustomFields.filter((v) => v.type !== CustomFieldType.Switch);
  const switchCustomFields = sortedCustomFields.filter((v) => v.type === CustomFieldType.Switch);

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
                    : v,
                ),
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
                            : v,
                        ),
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
