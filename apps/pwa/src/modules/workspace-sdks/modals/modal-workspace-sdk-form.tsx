"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { tl } from "@/modules/lang/lang-service";
import { createWorkspaceSdk } from "@/modules/workspace-sdks/workspace-sdks-service";
import { WorkspaceSdkEntity } from "@/modules/workspace-sdks/workspace-sdks-types";
import { onError } from "@/utils/exceptions.utils";
import { Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconPuzzle } from "@tabler/icons-react";
import { FC, useState } from "react";

interface ModalWorkspaceSdkFormProps {
  sdk?: WorkspaceSdkEntity;
  onFinish?: (sdk: WorkspaceSdkEntity) => Promise<any> | any;
}

export let OnModalWorkspaceSdkForm: (props: ModalWorkspaceSdkFormProps) => void = () => {};

export const ModalWorkspaceSdkForm: FC = () => {
  const [props, setProps] = useState<ModalWorkspaceSdkFormProps>();
  const [opened, { open, close }] = useDisclosure(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      ...props?.sdk,
    } as any,
    validate: {
      name: (value: string) => {
        if (!value) return tl("required");
      },
    },
  });

  OnModalWorkspaceSdkForm = (_props) => {
    setProps(_props);
    form.reset();
    form.setValues(_props.sdk || {});
    open();
  };

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    let payload = { ...values };

    await createWorkspaceSdk(payload)
      .then(async (res) => {
        if (props?.onFinish) await props.onFinish(res);
        close();
      })
      .catch(onError);

    setIsSubmitting(false);
  });

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<ModalTitle title={props?.sdk ? "Cập nhật SDK" : "Thêm SDK"} icon={IconPuzzle} />}
      zIndex={400}
    >
      <Stack>
        <TextInput withAsterisk label="Tên" {...form.getInputProps("name")} />

        <Button
          mt={10}
          loading={isSubmitting}
          onClick={onSubmit}
          leftSection={<IconCheck strokeWidth={1.2} />}
          type="submit"
        >
          {tl("complete")}
        </Button>
      </Stack>
    </Modal>
  );
};
