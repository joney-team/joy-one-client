"use client";

import { useApp } from "@/app.context";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { LocationForm } from "@/components/location-form";
import QUERY_WORKSPACE_BRANCH from "@/modules/workspace-branches/graphql/queryWorkspaceBranch.graphql";
import { getWorkspaceById } from "@/modules/workspaces/workspaces-service";
import { WorkspaceEntity } from "@/modules/workspaces/workspaces-types";
import { onError, onFormError } from "@/utils/exceptions.utils";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { Card, Center, Group, Loader, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";
import { WorkspaceBranchFragment } from "../workspace-branches/graphql/fragmentWorkspaceBranch.graphql";
import { CustomerFormFragment } from "./graphql/fragmentCustomerForm.graphql";
import CREATE_CUSTOMER_FORM_MUTATION from "./graphql/mutationCreateCustomerForm.graphql";

export const CustomerFormRegister: FC = () => {
  const app = useApp();
  const client = useApolloClient();
  const params = useParams<{ workspaceId: string; workspaceBranchId: string }>();
  const workspaceId = app.metadata.workspaceId || params.workspaceId;
  const workspaceBranchId =
    params.workspaceBranchId && params.workspaceBranchId !== "main"
      ? (params.workspaceBranchId as string)
      : null;
  const state = useRef<{
    workspace: WorkspaceEntity | null;
    workspaceBranch: WorkspaceBranchFragment | null;
  }>({
    workspace: null,
    workspaceBranch: null,
  });

  const [createCustomerForm] = useMutation(CREATE_CUSTOMER_FORM_MUTATION);

  const [customerForm, setCustomerForm] = useState<CustomerFormFragment | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const form = useForm<{
    name: string;
    phone: string;
    email?: string;
    vnLocation?: any;
  }>({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      vnLocation: {},
    },
    validate: {
      name: (value) => {
        if (!value) return "Họ và tên không được để trống";
        return null;
      },
      phone: (value) => {
        if (!value) return "Số điện thoại không được để trống";
        return null;
      },
      vnLocation: {
        address: (value) => {
          if (!value) return "Địa chỉ không được để trống";
          return null;
        },
        provinceId: (value) => {
          if (!value) return "Tỉnh/Thành phố không được để trống";
          return null;
        },
        wardId: (value) => {
          if (!value) return "Phường/Thị xã không được để trống";
          return null;
        },
      },
    },
  });

  const initialize = async () => {
    try {
      state.current.workspace = await getWorkspaceById(workspaceId);
      if (workspaceBranchId) {
        const results = await client.query({
          query: QUERY_WORKSPACE_BRANCH,
          variables: { id: workspaceBranchId },
        });
        state.current.workspaceBranch = results.data?.workspaceBranch ?? null;
      }
      setIsInitializing(false);
    } catch (error) {
      onError(error);
    }
  };

  const onSubmit = form.onSubmit(async (values) => {
    try {
      if (!state.current.workspace || isInitializing) return;

      const result = await createCustomerForm({
        variables: {
          input: {
            ...values,
            workspaceId: state.current.workspace._id,
            workspaceBranchId: state.current.workspaceBranch?._id || null,
          },
        },
      });

      if (result.data?.createCustomerForm) {
        setCustomerForm(result.data?.createCustomerForm);
      }
    } catch (error) {
      onFormError(form, error);
    }
  });

  useEffect(() => {
    initialize();
  }, []);

  if (isInitializing || !state.current.workspace) {
    return (
      <Stack mih="100dvh" justify="center" align="center" p={32}>
        <Loader type="dots" />
      </Stack>
    );
  }

  if (customerForm) {
    return (
      <Stack mih="100dvh" justify="center" align="center" p={32}>
        <Avatar size={60} workspace={state.current.workspace} />
        <Title ta="center" fz={20} fw={600}>
          Cảm ơn bạn đã liên hệ
        </Title>
        <Text ta="center" fz={14} c="var(--mantine-color-dimmed)">
          Chúng tôi sẽ liên hệ cho bạn sớm nhất có thể
        </Text>
      </Stack>
    );
  }

  return (
    <Stack mih="100dvh" justify="center" align="center" p={32} gap={32}>
      <Group>
        <Avatar size={60} workspace={state.current.workspace} />
        <Stack gap={5}>
          <Title ta="center" fz={20} fw={600}>
            {state.current.workspace.name}
          </Title>
          {state.current.workspaceBranch && (
            <Title order={3} ta="center" fz={14} fw={400}>
              CN: {state.current.workspaceBranch?.name}
            </Title>
          )}
        </Stack>
      </Group>

      <Card shadow="xs" style={{ overflow: "visible" }}>
        <form onSubmit={onSubmit}>
          <Stack w={400} maw="100%">
            <Title ta="center" fz={20} fw={400}>
              Đăng ký nhận tư vấn
            </Title>

            <TextInput
              withAsterisk
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              {...form.getInputProps("name")}
            />

            <TextInput
              label="Số điện thoại"
              withAsterisk
              placeholder="Nhập số điện thoại"
              {...form.getInputProps("phone")}
            />

            <TextInput label="Email" placeholder="Nhập email" {...form.getInputProps("email")} />

            <LocationForm form={form} required />

            <Center mt={12}>
              <Button loading={form.submitting} rightIcon={IconCheck} type="submit">
                Đăng ký
              </Button>
            </Center>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
};
