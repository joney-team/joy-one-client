"use client";

import { Button } from "@/components/buttons/button";
import { configs } from "@/configs/layout.config";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import {
  Card,
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
import {
  IconCake,
  IconCheck,
  IconClipboardHeart,
  IconLocation,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import { FC, useEffect } from "react";
import { createCustomer, updateCustomer } from "../customer-service";

import { Form } from "@/components/form";
import { DateInput } from "@/components/inputs/date-input";
import { genders } from "@/constant";
import { useRouter } from "@/hooks/use-router";
import { api } from "@/modules/apis";
import { getClientLocale } from "@/modules/lang/lang-service";
import { WorkspaceBranchInput } from "@/modules/workspace-branches/workspace-branch-input";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { Gender } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { LocationForm } from "../../../components/location-form";
import { Renderer } from "../../../components/renderer";
import { CustomerRelationshipContactInput } from "./customer-relationship-contact-input";
import { AppLocale } from "@/modules/lang/lang-types";

export interface CustomerFormProps {
  onDone?: (customer: CustomerEntity) => void | Promise<void>;
  onClose?: () => void;
  customer?: CustomerEntity;
  relationship?: boolean;
}

export const medicalHistoryOptions: { [key in AppLocale]: string[] } = {
  [AppLocale.VI]: [
    "Tiểu đường",
    "Huyết áp cao",
    "Huyết áp thấp",
    "Bệnh lí gan/thận",
    "Tim mạch",
    "Dị ứng thuốc",
    "Lâu cầm máu",
    "Thai/kinh nguyệt",
    "Thần kinh",
  ],
  [AppLocale.EN]: [
    "Diabetes",
    "High blood pressure",
    "Low blood pressure",
    "Liver/kidney disease",
    "Heart disease",
    "Drug allergy",
    "Long-term bleeding",
    "Pregnancy/menstruation",
    "Nervous system",
  ],
};

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
      vnLocation: props.customer?.vnLocation || {},
      vnSecondaryLocation: props.customer?.vnSecondaryLocation || {},
    },
    validate: {
      name: (value: string) => {
        if (!value) return t`Must be provided`;
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

  const convertLocations = async () => {
    if (!props.customer) return;

    const updated = await api.patch<CustomerEntity>(
      `/customers/${props.customer?._id}/convert-vn-locations`
    );

    form.setFieldValue("vnLocation", updated.vnLocation);
    form.setFieldValue("vnSecondaryLocation", updated.vnSecondaryLocation);
  };

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
          label={t`Branch`}
          value={form.values.workspaceBranch}
          onChange={(branch) => form.setFieldValue("workspaceBranch", branch)}
        />

        <TextInput autoFocus withAsterisk label={t`Name`} {...form.getInputProps("name")} />
        <TextInput
          label={t`Phone`}
          placeholder={configs.placeholders.phone}
          {...form.getInputProps("phone")}
          leftSection={<IconPhone strokeWidth={1.2} size={18} />}
        />
        <TextInput
          label={t`Email`}
          placeholder={configs.placeholders.email}
          {...form.getInputProps("email")}
          leftSection={<IconMail strokeWidth={1.2} size={18} />}
        />

        <Renderer visible={workspace.type === WorkspaceType.CREDIT}>
          <NumberInput
            label={t`Salary amount`}
            {...form.getInputProps("salaryAmount")}
            hideControls
          />
        </Renderer>

        <Group align="start">
          <DateInput
            label={t`Birthday`}
            {...form.getInputProps("birthday")}
            style={{ flex: 1 }}
            leftSection={<IconCake strokeWidth={1.2} size={18} />}
          />

          <Select
            label={t`Gender`}
            searchable
            data={Object.values(Gender).map((gender) => ({
              label: genders[gender].name(),
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
                {t`Current address`}
              </Text>
              <Card withBorder shadow="none" p={10}>
                <Stack gap={8}>
                  <LocationForm form={form} path="vnLocation" />
                </Stack>
              </Card>
            </Stack>

            <Stack gap={5}>
              <Text fz={em(11)} fw={500}>
                {t`Secondary address`} ({t`Homeland`})
              </Text>
              <Card withBorder shadow="none" p={10}>
                <Stack gap={8}>
                  <LocationForm form={form} path="vnSecondaryLocation" />
                </Stack>
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
            label={t`Medical history`}
            leftSection={<IconClipboardHeart strokeWidth={1.2} size={18} />}
            style={{ flex: 1 }}
            data={medicalHistoryOptions[getClientLocale()]}
            {...form.getInputProps("medicalHistory")}
          />
        </Renderer>

        <Renderer visible={[WorkspaceType.CREDIT].includes(workspace.type)}>
          <CustomerRelationshipContactInput {...form.getInputProps("relationshipContacts")} />
        </Renderer>

        <WorkspaceMembersInput
          label={t`Assignee`}
          style={{ flex: 1 }}
          {...form.getInputProps("assigneeUsers")}
        />

        <Group mt={10} justify="center" align="center">
          {props.customer && (
            <Button leftIcon={IconLocation} variant="outline" onClick={convertLocations}>
              <Trans>Convert locations</Trans>
            </Button>
          )}

          <Button
            type="submit"
            loading={form.submitting}
            leftIcon={IconCheck}
            disabled={!form.isDirty()}
          >
            <Trans>Complete</Trans>
          </Button>
        </Group>
      </Stack>
    </Form>
  );
};
