import { useQuery } from "@/modules/apis/use-query";
import { EventType } from "@/modules/events/event-types";
import { AppEntity, ResponseList } from "@/types";
import { FC, Fragment } from "react";
import { CustomField, CustomFieldEntity } from "../custom-field-types";
import { customFieldInputs } from "../inputs/_index";

export interface CustomFieldInputProps {
  customField: CustomFieldEntity;
  value?: any;
  onChange: (value: any) => void;
}

export interface BuilderCustomFieldsProps {
  entity: AppEntity;
  value?: CustomField[];
  onChange: (value: CustomField[]) => void;
}

export const BuilderCustomFields: FC<BuilderCustomFieldsProps> = (props) => {
  const customFields = useQuery<ResponseList<CustomFieldEntity>>({
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

  return (
    <Fragment>
      {customFields.data?.data?.map((customField) => {
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
    </Fragment>
  );
};
