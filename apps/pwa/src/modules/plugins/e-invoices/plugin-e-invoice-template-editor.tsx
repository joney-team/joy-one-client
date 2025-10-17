import { Button } from "@/components/buttons/button";
import { t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  ActionIcon,
  Card,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  PluginEInvoiceTemplate,
  PluginEInvoiceTemplateField,
  PluginEInvoiceTemplateType,
  PluginEInvoiceTemplateVariables,
} from "./plugin-e-invoices.types";

const getInitField = (): PluginEInvoiceTemplateField => ({
  id: uuidv4(),
  type: "input",
});

const TemplateField: FC<{
  templateType: PluginEInvoiceTemplateType;
  index: number;
  field: Partial<PluginEInvoiceTemplateField>;
  onChange: (field: Partial<PluginEInvoiceTemplateField>) => void;
  variables: PluginEInvoiceTemplateVariables | null;
  onRemove: () => void;
}> = (props) => {
  const workspace = useWorkspace();
  const fieldType = props.field.type ?? "variable";
  const fieldVariableName = props.field.variable ?? "";

  const availableVariables = Object.entries(props.variables ?? {}).reduce((acc, [key, value]) => {
    if (value.templateTypes && !value.templateTypes?.includes(props.templateType)) {
      return acc;
    }

    if (value.workspaceTypes && !value.workspaceTypes?.includes(workspace.type)) {
      return acc;
    }

    return {
      ...acc,
      [key]: value,
    };
  }, {} as PluginEInvoiceTemplateVariables);

  const fieldVariable = availableVariables[fieldVariableName];
  const children = props.field.children ?? [];

  const onChildChange = (id: string, field: Partial<PluginEInvoiceTemplateField>) => {
    props.onChange({
      ...props.field,
      children: props.field.children?.map((f) => (f.id === id ? { ...f, ...field } : f)) ?? [],
    });
  };

  const onChildRemove = (id: string) => {
    props.onChange({
      ...props.field,
      children: props.field.children?.filter((child) => child.id !== id) ?? [],
    });
  };

  return (
    <Card shadow="none" withBorder p={10}>
      <Group wrap="nowrap">
        <Stack flex={1} gap={10}>
          <Group wrap="nowrap" flex={1} gap={10}>
            <Text fz={14} c="gray">
              {props.index + 1}.
            </Text>

            <TextInput
              w={120}
              placeholder={t("field_name")}
              value={props.field.fieldName ?? ""}
              onChange={(e) => {
                props.onChange({ ...props.field, fieldName: e.target.value });
              }}
            />

            <SegmentedControl
              data={[
                {
                  value: "input",
                  label: t("manual_input"),
                },
                {
                  value: "variable",
                  label: t("variable"),
                  disabled: Object.keys(availableVariables).length === 0,
                },
              ]}
              value={fieldType}
              onChange={(value) => {
                props.onChange({
                  ...props.field,
                  type: value as PluginEInvoiceTemplateField["type"],
                  variable: null,
                  value: null,
                });
              }}
            />

            {fieldType === "variable" && (
              <Select
                flex={1}
                placeholder={t("variable")}
                data={Object.keys(availableVariables).map((key) => ({
                  label: t(`e_invoice_variable_${key}`),
                  value: key,
                }))}
                value={props.field.variable}
                onChange={(value) => {
                  props.onChange({ ...props.field, variable: value });
                }}
              />
            )}

            {fieldType === "input" && (
              <Fragment>
                <SegmentedControl
                  data={[
                    {
                      value: "text",
                      label: t("text"),
                    },
                    {
                      value: "number",
                      label: t("number"),
                    },
                  ]}
                  value={props.field.inputType ?? "text"}
                  onChange={(value) => {
                    props.onChange({
                      ...props.field,
                      inputType: value as PluginEInvoiceTemplateField["inputType"],
                    });
                  }}
                />

                {props.field.inputType === "number" ? (
                  <NumberInput
                    flex={1}
                    placeholder={t("value")}
                    value={props.field.value ?? ""}
                    onChange={(e) => {
                      props.onChange({ ...props.field, value: e });
                    }}
                  />
                ) : (
                  <TextInput
                    flex={1}
                    placeholder={t("value")}
                    value={props.field.value ?? ""}
                    onChange={(e) => {
                      props.onChange({ ...props.field, value: e.target.value });
                    }}
                  />
                )}
              </Fragment>
            )}
          </Group>

          {fieldVariable && fieldVariable.childVariables && (
            <Stack pl={26}>
              <Card shadow="none" withBorder={false} bg="gray.0" p={10}>
                <Stack gap={10}>
                  {children.map((child, index) => {
                    return (
                      <TemplateField
                        templateType={props.templateType}
                        index={index}
                        key={props.index.toString() + index.toString()}
                        field={child}
                        variables={fieldVariable.childVariables as PluginEInvoiceTemplateVariables}
                        onRemove={() => onChildRemove(child.id)}
                        onChange={(field) => {
                          onChildChange(child.id, field);
                        }}
                      />
                    );
                  })}

                  <Group justify="end">
                    <Button
                      variant="outline"
                      leftIcon={IconPlus}
                      color="gray"
                      size="xs"
                      onClick={() => {
                        props.onChange({
                          ...props.field,
                          children: [...children, getInitField()],
                        });
                      }}
                    >
                      {t("add_entity", { entity: t("child_field") })}
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          )}
        </Stack>

        <ActionIcon onClick={props.onRemove} variant="subtle" color="gray" size="xs">
          <IconTrash size={14} />
        </ActionIcon>
      </Group>
    </Card>
  );
};

export interface PluginEInvoiceTemplateEditorProps {
  type: PluginEInvoiceTemplateType;
  template: PluginEInvoiceTemplate | undefined;
  onChange: (template: PluginEInvoiceTemplate) => void;
  variables: PluginEInvoiceTemplateVariables;
}

export const PluginEInvoiceTemplateEditor: FC<PluginEInvoiceTemplateEditorProps> = (props) => {
  const { variables } = props;

  return (
    <Stack>
      {props.template?.fields?.map((field, index) => (
        <TemplateField
          key={field.id}
          templateType={props.type}
          index={index}
          field={field}
          variables={variables}
          onRemove={() => {
            props.onChange({
              ...props.template,
              fields: props.template?.fields?.filter((f) => f.id !== field.id) ?? [],
            });
          }}
          onChange={(field) => {
            props.onChange({
              ...props.template,
              fields: props.template?.fields?.map((f) => (f.id === field.id ? field : f)) ?? [],
            });
          }}
        />
      ))}

      <Group justify="end">
        <Button
          size="xs"
          variant="outline"
          leftIcon={IconPlus}
          onClick={() => {
            props.onChange({
              ...props.template,
              fields: [...(props.template?.fields ?? []), getInitField()],
            });
          }}
        >
          {t("add_entity", { entity: t("field") })}
        </Button>
      </Group>
    </Stack>
  );
};
