import { Button } from "@/components/buttons/button";
import { Form } from "@/components/form";
import { TextInput } from "@/components/inputs/text-input";
import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { createWorkspaceBranch, updateWorkspaceBranch } from "@/modules/workspace-branches/workspace-branches-service";
import { WorkspaceBranchDto, WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconBuilding, IconCheck, IconPlus } from "@tabler/icons-react";
import { FC, useState } from "react";

export const WorkspaceBranchModal: FC<{ branch?: WorkspaceBranchEntity }> = ({ branch }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<WorkspaceBranchDto>({
    initialValues: {
      name: branch?.name || "",
      hotline: branch?.hotline || "",
      location: {
        provinceId: branch?.location?.provinceId || "",
        districtId: branch?.location?.districtId || "",
        wardId: branch?.location?.wardId || "",
        address: branch?.location?.address || "",
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    if (branch) {
      await updateWorkspaceBranch(branch._id, values);
    } else {
      await createWorkspaceBranch(values);
    }
    modals.closeAll();
    setLoading(false);
  });

  return (
    <Form onSubmit={onSubmit}>
      <Stack>
        <TextInput withAsterisk label={t("name")} {...form.getInputProps("name")} autoFocus />

        <TextInput label={t("hotline")} {...form.getInputProps("hotline")} />

        <TextInput label={t("address")} {...form.getInputProps("location.address")} />

        <Stack align="center">
          <Button action leftIcon={branch ? IconCheck : IconPlus} loading={loading} onClick={onSubmit} type="submit">
            {t(branch ? "edit" : "create")}
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
};

export const OnWorkspaceBranchModal = (branch?: WorkspaceBranchEntity) => {
  return modals.open({
    title: <ModalTitle title={`${t(branch ? "edit" : "create")} ${t("workspace_branch")}`} icon={IconBuilding} />,
    children: <WorkspaceBranchModal branch={branch} />,
  });
};
