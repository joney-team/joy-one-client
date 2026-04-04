"use client";

import { Button } from "@/components/buttons/button";
import { Form } from "@/components/form";
import { ModalHead } from "@/components/modal/modal-head";
import { WorkspaceBranchInput } from "@/graphql/types.graphql";
import { FormBankAccount } from "@/modules/plugins/banks/form-bank-account";
import { useMutation } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Stack, Tabs, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconBuilding, IconCheck, IconPlus } from "@tabler/icons-react";
import { FC, useState } from "react";
import CreateWorkspaceBranchDocument from "../graphql/createWorkspaceBranch.graphql";
import { WorkspaceBranchFragment } from "../graphql/fragmentWorkspaceBranch.graphql";
import UpdateWorkspaceBranchDocument from "../graphql/updateWorkspaceBranch.graphql";

export const WorkspaceBranchModal: FC<{ branch?: WorkspaceBranchFragment }> = ({ branch }) => {
  const [loading, setLoading] = useState(false);

  const [updateWorkspaceBranch] = useMutation(UpdateWorkspaceBranchDocument);
  const [createWorkspaceBranch] = useMutation(CreateWorkspaceBranchDocument);

  const form = useForm<WorkspaceBranchInput>({
    initialValues: {
      name: branch?.name || "",
      hotline: branch?.hotline || "",
      location: {
        provinceId: branch?.location?.provinceId || "",
        districtId: branch?.location?.districtId || "",
        wardId: branch?.location?.wardId || "",
        address: branch?.location?.address || "",
      },
      settings: branch?.settings || {},
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    if (branch) {
      await updateWorkspaceBranch({ variables: { id: branch._id, input: values } });
    } else {
      await createWorkspaceBranch({ variables: { input: values } });
    }
    modals.closeAll();
    setLoading(false);
  });

  return (
    <Form onSubmit={onSubmit}>
      <Stack>
        <Tabs defaultValue="info" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="info">{t`Information`}</Tabs.Tab>
            <Tabs.Tab value="bank">{t`Bank`}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="info">
            <Stack py={16}>
              <TextInput withAsterisk label={t`Name`} {...form.getInputProps("name")} autoFocus />

              <TextInput label={t`Hotline`} {...form.getInputProps("hotline")} />

              <TextInput label={t`Address`} {...form.getInputProps("location.address")} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="bank">
            <Stack py={16}>
              <FormBankAccount
                bankAccount={form.values.settings?.bankAccount}
                onChange={(acc) => form.setFieldValue("settings.bankAccount", acc)}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Stack align="center">
          <Button
            leftIcon={branch ? IconCheck : IconPlus}
            loading={loading}
            onClick={() => onSubmit()}
            type="submit"
          >
            {branch ? <Trans>Edit</Trans> : <Trans>Create</Trans>}
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
};

export const OnWorkspaceBranchModal = (branch?: WorkspaceBranchFragment) => {
  return modals.open({
    title: (
      <ModalHead
        name={branch ? t`Edit workspace branch` : t`Create new workspace branch`}
        icon={IconBuilding}
      />
    ),
    children: <WorkspaceBranchModal branch={branch} />,
  });
};
