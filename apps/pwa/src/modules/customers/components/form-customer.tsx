"use client";

import { Button } from "@/components/buttons/button";
import { configs } from "@/configs/layout.config";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import {
  Card,
  Center,
  em,
  Group,
  NumberInput,
  Select,
  Stack,
  TagsInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCake, IconCheck, IconClipboardHeart, IconMail, IconPhone } from "@tabler/icons-react";
import { FC, useEffect } from "react";
import { createCustomer, updateCustomer } from "../customer-service";

import { Form } from "@/components/form";
import { DateInput } from "@/components/inputs/date-input";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { medicalHistoryOptions } from "@/configs/medical.config";
import { useRouter } from "@/hooks/use-router";
import { getLocaleClient, t } from "@/modules/lang/lang-service";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { Gender } from "@/types";
import { LocationForm } from "../../../components/location-form";
import { Renderer } from "../../../components/renderer";
import { CustomerRelationshipContactInput } from "./customer-relationship-contact-input";
import { WorkspaceBranchInput } from "@/modules/workspace-branches/workspace-branch-input";

export interface CustomerFormProps {
  onDone?: (customer: CustomerEntity) => void | Promise<void>;
  onClose?: () => void;
  customer?: CustomerEntity;
  relationship?: boolean;
}

export const CustomerForm: FC<CustomerFormProps> = (props) => {
  const workspace = useWorkspace();
  const router = useRouter();
  const isShowSecondaryLocation = [WorkspaceType.CREDIT].includes(workspace.type);

  const form = useForm({
    initialValues: {
      name: props.customer?.name || "",
      ...(props.customer ||
        ({
          assigneeUsers: [workspace.userMember],
        } as any)),
      location: props.customer?.location || {},
      secondaryLocation: props.customer?.secondaryLocation || {},
    },
    validate: {
      name: (value: string) => {
        if (!value) return t("must_be_provided");
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    let payload = {
      ...values,
      assigneeUserIds: values.assigneeUsers.map((user: WorkspaceMember) => user.userId),
      presenterCustomerId: values.presenterCustomer?._id,
      relatedCustomerIds: values.relatedCustomers?.map((c: CustomerEntity) => c._id),
      workspaceBranchId: values.workspaceBranch?._id,
    };

    delete payload.assigneeUsers;
    delete payload.presenterCustomer;

    const action = props.customer
      ? () => updateCustomer(props.customer!._id, payload)
      : () => createCustomer(payload);

    await action()
      .then(async (res) => {
        if (props.onDone) await props.onDone?.(res);
        else router.push(`/customers/${res.code}`);
        props.onClose?.();
      })
      .catch(onError);
  });

  useEffect(() => {
    form.reset();
    form.setValues({
      ...(props.customer ||
        ({
          assigneeUsers: [workspace.userMember],
        } as any)),
      name: props.customer?.name || "",
      location: props.customer?.location || {},
      secondaryLocation: props.customer?.secondaryLocation || {},
    });
  }, [props.customer]);

  return (
    <Form onSubmit={onSubmit}>
      <Stack>
        <WorkspaceBranchInput
          label={t("branch")}
          value={form.values.workspaceBranch}
          onChange={(branch) => form.setFieldValue("workspaceBranch", branch)}
        />

        <TextInput autoFocus withAsterisk label={t("name")} {...form.getInputProps("name")} />
        <TextInput
          label={t("phone")}
          placeholder={configs.placeholders.phone}
          {...form.getInputProps("phone")}
          leftSection={<IconPhone strokeWidth={1.2} size={18} />}
        />
        <TextInput
          label="Email"
          placeholder={configs.placeholders.email}
          {...form.getInputProps("email")}
          leftSection={<IconMail strokeWidth={1.2} size={18} />}
        />

        <Renderer visible={workspace.type === WorkspaceType.CREDIT}>
          <NumberInput
            label={t("salary_amount")}
            {...form.getInputProps("salaryAmount")}
            hideControls
          />
        </Renderer>

        <Group align="start">
          <DateInput
            label={t("birthday")}
            {...form.getInputProps("birthday")}
            style={{ flex: 1 }}
            leftSection={<IconCake strokeWidth={1.2} size={18} />}
          />

          <Select
            label={t("gender")}
            searchable
            data={Object.values(Gender).map((gender) => ({
              label: t(gender).toString(),
              value: gender,
            }))}
            {...form.getInputProps("gender")}
            style={{ flex: 1 }}
          />
        </Group>

        <Renderer visible={isShowSecondaryLocation}>
          <Stack gap={16}>
            <Stack gap={5}>
              <Text fz={em(11)} fw={500}>
                Địa chỉ hiện tại
              </Text>
              <Card withBorder shadow="none" p={10}>
                <LocationForm form={form} />
              </Card>
            </Stack>

            <Stack gap={5}>
              <Text fz={em(11)} fw={500}>
                Địa chỉ thứ 2 (Quê quán)
              </Text>
              <Card withBorder shadow="none" p={10}>
                <LocationForm form={form} path="secondaryLocation" />
              </Card>
            </Stack>
          </Stack>
        </Renderer>

        <Renderer visible={!isShowSecondaryLocation}>
          <LocationForm form={form} />
        </Renderer>

        <Renderer
          visible={[WorkspaceType.HOSPITAL, WorkspaceType.CLINIC, WorkspaceType.DENTAL].includes(
            workspace.type
          )}
        >
          <TagsInput
            label={t("medical_history")}
            leftSection={<IconClipboardHeart strokeWidth={1.2} size={18} />}
            style={{ flex: 1 }}
            data={medicalHistoryOptions[getLocaleClient()]}
            {...form.getInputProps("medicalHistory")}
          />
        </Renderer>

        <Renderer visible={[WorkspaceType.CREDIT].includes(workspace.type)}>
          <CustomerRelationshipContactInput {...form.getInputProps("relationshipContacts")} />
        </Renderer>

        <WorkspaceMembersInput
          label={t("assignee")}
          style={{ flex: 1 }}
          {...form.getInputProps("assigneeUsers")}
        />

        <Center mt={10}>
          <Button
            type="submit"
            loading={form.submitting}
            leftIcon={IconCheck}
            disabled={!form.isDirty()}
          >
            {t("complete")}
          </Button>
        </Center>
      </Stack>
    </Form>
  );
};
