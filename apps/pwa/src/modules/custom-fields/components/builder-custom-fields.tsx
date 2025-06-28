import { useQuery } from "@/modules/apis/use-query";
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
  });

  const values = (customFields.data?.data || []).map((customField) => ({
    customField,
    customFieldId: customField._id,
    value: props.value?.find((v) => v.customField._id === customField._id)?.value,
  }));

  return (
    <Fragment>
      {customFields.data?.data?.map((customField) => {
        const Input = customFieldInputs[customField.type];
        const customFieldValue = values.find((v) => v.customField._id === customField._id);

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
                values.map((v) => (v.customField._id === customField._id ? { ...v, value } : v))
              );
            }}
          />
        );
      })}
    </Fragment>
  );
};
