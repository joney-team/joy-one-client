"use client";

import { Button } from "@/components/buttons/button";
import { configs } from "@/configs/layout.config";
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
import { IconCake, IconCheck, IconClipboardHeart, IconMail, IconPhone } from "@tabler/icons-react";
import { FC, useEffect } from "react";

import { Form } from "@/components/form";
import { DateInput } from "@/components/inputs/date-input";
import { genders } from "@/constant";
import { AppLocale, WorkspaceType } from "@/graphql/enums.graphql";
import { CustomerInput } from "@/graphql/types.graphql";
import { useRouter } from "@/hooks/use-router";
import { getClientLocale } from "@/modules/lang/lang-service";
import { WorkspaceBranchInput } from "@/modules/workspace-branches/workspace-branch-input";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { Gender } from "@/types";
import { useMutation } from "@apollo/client/react";
import { normalizeObject } from "@joy-one-client/utils/object";
import { Trans, useLingui } from "@lingui/react/macro";
import { LocationForm } from "../../../components/location-form";
import { Renderer } from "../../../components/renderer";
import { CustomerRelationshipContactInput } from "../customer-detail/customer-relationship-contact-input";
import { CustomerDataFragment } from "../graphql/fragmentCustomer.graphql";
import CREATE_CUSTOMER_MUTATION from "../graphql/mutationCreateCustomer.graphql";
import UPDATE_CUSTOMER_MUTATION from "../graphql/mutationUpdateCustomer.graphql";
import { removeTypeName } from "@joy-one-client/utils/remove-type-name";

export interface CustomerFormProps {
  onDone?: (customer: CustomerDataFragment) => void | Promise<void>;
  onClose?: () => void;
  customer?: CustomerDataFragment;
  relationship?: boolean;
}

export const medicalHistoryOptions: { [key in AppLocale]: string[] } = {
  [AppLocale.Vi]: [
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
  [AppLocale.En]: [
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
  const { t } = useLingui();
  const workspace = useWorkspace();
  const router = useRouter();
  const isShowSecondaryLocation = [WorkspaceType.Credit]
    .map((t) => t.toString())
    .includes(workspace.type);

  const [createCustomer] = useMutation(CREATE_CUSTOMER_MUTATION);
  const [updateCustomer] = useMutation(UPDATE_CUSTOMER_MUTATION);

  const form = useForm<Partial<CustomerDataFragment>>({
    initialValues: normalizeObject({
      name: props.customer?.name || "",
      ...(props.customer
        ? {
            assigneeUsers: [workspace.member],
          }
        : { assigneeUsers: [] }),
      vnLocation: props.customer?.vnLocation || null,
      vnSecondaryLocation: props.customer?.vnSecondaryLocation || null,
    }),
    validate: {
      name: (value) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onSubmit = form.onSubmit(async ({ _id, ...values }) => {
    const input: CustomerInput = removeTypeName({
      name: values.name || "",
      phone: values.phone,
      email: values.email,
      birthday: values.birthday,
      gender: values.gender,
      medicalHistory: values.medicalHistory,
      relationshipContacts: values.relationshipContacts,
      presenterCustomerId: values.presenterCustomerId,
      assigneeUserIds: values.assigneeUsers?.map((user) => user.userId) ?? [],
      relatedCustomerIds: values.relatedCustomerIds,
      workspaceBranchId: values.workspaceBranchId,
      salaryAmount: values.salaryAmount,
      vnLocation: values.vnLocation,
      vnSecondaryLocation: values.vnSecondaryLocation,
      secondaryLocation: values.secondaryLocation,
      location: values.location,
      tagIds: values.tagIds,
      avatar: values.avatar,
      createdAt: values.createdAt,
      plainCode: values.plainCode,
      socialFacebookUrl: values.socialFacebookUrl,
    });

    const action = props.customer
      ? () =>
          updateCustomer({
            variables: {
              id: props.customer!._id,
              input,
            },
          })
      : () =>
          createCustomer({
            variables: {
              input,
            },
          });

    await action()
      .then(async (res) => {
        if (props.onDone && res.data) await props.onDone?.(res.data?.customer);
        else router.push(`/customers/${res.data?.customer?.code}`);
        props.onClose?.();
      })
      .catch(onError);
  });

  useEffect(() => {
    form.reset();
    form.setValues(
      normalizeObject({
        ...(props.customer || {
          assigneeUsers: [workspace.member],
        }),
        name: props.customer?.name || "",
        vnLocation: props.customer?.vnLocation || null,
        secondaryLocation: props.customer?.secondaryLocation || null,
      }),
    );
  }, [props.customer]);

  return (
    <Form onSubmit={onSubmit}>
      <Stack>
        <WorkspaceBranchInput
          label={<Trans>Branch</Trans>}
          value={form.values.workspaceBranch ?? null}
          onChange={(branch) => form.setFieldValue("workspaceBranch", branch as any)}
        />

        <TextInput
          autoFocus
          withAsterisk
          label={<Trans>Name</Trans>}
          {...form.getInputProps("name")}
        />

        <TextInput
          label={<Trans>Phone</Trans>}
          placeholder={configs.placeholders.phone}
          {...form.getInputProps("phone")}
          leftSection={<IconPhone strokeWidth={1.2} size={18} />}
        />
        <TextInput
          label={<Trans>Email</Trans>}
          placeholder={configs.placeholders.email}
          {...form.getInputProps("email")}
          leftSection={<IconMail strokeWidth={1.2} size={18} />}
        />

        <Renderer visible={workspace.type === WorkspaceType.Credit}>
          <NumberInput
            label={<Trans>Salary amount</Trans>}
            {...form.getInputProps("salaryAmount")}
            hideControls
          />
        </Renderer>

        <Group align="start">
          <DateInput
            label={<Trans>Birthday</Trans>}
            {...form.getInputProps("birthday")}
            style={{ flex: 1 }}
            leftSection={<IconCake strokeWidth={1.2} size={18} />}
          />

          <Select
            label={<Trans>Gender</Trans>}
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
                <Trans>Current address</Trans>
              </Text>
              <Card withBorder shadow="none" p={10}>
                <Stack gap={8}>
                  <LocationForm form={form} path="vnLocation" />
                </Stack>
              </Card>
            </Stack>

            <Stack gap={5}>
              <Text fz={em(11)} fw={500}>
                <Trans>Secondary address</Trans> (<Trans>Homeland</Trans>)
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
          visible={[WorkspaceType.Hospital, WorkspaceType.Clinic, WorkspaceType.Dental]
            .map((t) => t.toString())
            .includes(workspace.type)}
        >
          <TagsInput
            label={<Trans>Medical history</Trans>}
            leftSection={<IconClipboardHeart strokeWidth={1.2} size={18} />}
            style={{ flex: 1 }}
            data={medicalHistoryOptions[getClientLocale()]}
            {...form.getInputProps("medicalHistory")}
          />
        </Renderer>

        <Renderer
          visible={[WorkspaceType.Credit].map((t) => t.toString()).includes(workspace.type)}
        >
          <CustomerRelationshipContactInput {...form.getInputProps("relationshipContacts")} />
        </Renderer>

        <WorkspaceMembersInput
          label={<Trans>Assignee</Trans>}
          style={{ flex: 1 }}
          {...form.getInputProps("assigneeUsers")}
        />

        <Group mt={10} justify="center" align="center">
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
