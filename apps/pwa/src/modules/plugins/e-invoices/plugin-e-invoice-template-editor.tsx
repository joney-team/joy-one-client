"use client";

import { Button } from "@/components/buttons/button";
import { FormulaInput } from "@/components/inputs/formual-input/formula-input";
import { tl } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  ActionIcon,
  Card,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { FC } from "react";
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
  fieldName: "",
  value: "",
});

const TemplateField: FC<{
  templateType: PluginEInvoiceTemplateType;
  index: number;
  field: PluginEInvoiceTemplateField;
  onChange: (field: PluginEInvoiceTemplateField) => void;
  variables: PluginEInvoiceTemplateVariables | null;
  onRemove: () => void;
}> = (props) => {
  const workspace = useWorkspace();
  const fieldType = props.field.type;

  const availableVariables = Object.entries(props.variables ?? {}).reduce<{
    selectable: PluginEInvoiceTemplateVariables;
    formula: PluginEInvoiceTemplateVariables;
  }>(
    (acc, [key, value]) => {
      if (value.templateTypes && !value.templateTypes?.includes(props.templateType)) {
        return acc;
      }

      if (value.workspaceTypes && !value.workspaceTypes?.includes(workspace.type)) {
        return acc;
      }

      if (value.isSelectable) return { ...acc, selectable: { ...acc.selectable, [key]: value } };
      return { ...acc, formula: { ...acc.formula, [key]: value } };
    },
    { selectable: {}, formula: {} }
  );

  const selectedVariable = availableVariables["selectable"][props.field.variable ?? ""];
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
    <Card shadow="none" withBorder p={10} style={{ overflow: "visible" }}>
      <Group wrap="nowrap">
        <Stack flex={1} gap={10}>
          <Group wrap="nowrap" flex={1} gap={10}>
            <Text fz={14} c="gray">
              {props.index + 1}.
            </Text>

            <TextInput
              w={120}
              placeholder={tl("field_name")}
              value={props.field.fieldName ?? ""}
              onChange={(e) => {
                props.onChange({ ...props.field, fieldName: e.target.value });
              }}
            />

            <SegmentedControl
              data={[
                {
                  value: "input",
                  label: tl("manual_input"),
                },
                {
                  value: "variable",
                  label: tl("variable"),
                  disabled: Object.keys(availableVariables.selectable).length === 0,
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

            {fieldType === "variable" ? (
              <Select
                flex={1}
                placeholder={tl("variable")}
                data={Object.keys(availableVariables.selectable).map((key) => ({
                  label: tl(`e_invoice_variable_${key}`),
                  value: key,
                }))}
                value={props.field.variable}
                onChange={(value) => {
                  props.onChange({ ...props.field, variable: value });
                }}
              />
            ) : (
              <FormulaInput
                key={props.field.id}
                value={String(props.field.value ?? "")}
                onChange={(e) => {
                  props.onChange({ ...props.field, value: e });
                }}
                variables={Object.entries(availableVariables.formula).map(([key, value]) => ({
                  name: key,
                  description: tl(`e_invoice_variable_${key}`),
                  isNumerical: value.isNumerical,
                }))}
              />
            )}
          </Group>

          {selectedVariable && selectedVariable.childVariables && (
            <Stack pl={26}>
              <Card
                shadow="none"
                withBorder={false}
                bg="gray.0"
                p={10}
                style={{ overflow: "visible" }}
              >
                <Stack gap={10}>
                  {children.map((child, index) => {
                    return (
                      <TemplateField
                        templateType={props.templateType}
                        index={index}
                        key={props.index.toString() + index.toString()}
                        field={child}
                        variables={{
                          ...selectedVariable.childVariables,
                          ...props.variables,
                        }}
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
                      {tl("add_entity", { entity: tl("child_field") })}
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
          {tl("add_entity", { entity: tl("field") })}
        </Button>
      </Group>
    </Stack>
  );
};
