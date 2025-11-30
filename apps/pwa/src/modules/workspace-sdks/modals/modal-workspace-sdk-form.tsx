"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { createWorkspaceSdk } from "@/modules/workspace-sdks/workspace-sdks-service";
import { WorkspaceSdkEntity } from "@/modules/workspace-sdks/workspace-sdks-types";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconPuzzle } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useState } from "react";

interface ModalWorkspaceSdkFormProps {
  sdk?: WorkspaceSdkEntity;
  onFinish?: (sdk: WorkspaceSdkEntity) => Promise<any> | any;
}

export const ModalWorkspaceSdkForm: FC<{
  children: (open: (props?: ModalWorkspaceSdkFormProps) => void) => ReactNode;
}> = ({ children }) => {
  const [props, setProps] = useState<ModalWorkspaceSdkFormProps>();
  const [opened, { open, close }] = useDisclosure(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      ...props?.sdk,
    } as any,
    validate: {
      name: (value: string) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

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
    <Fragment>
      {children((p) => {
        setProps(p);
        form.reset();
        form.setValues(p?.sdk || {});
        open();
      })}

      <Modal
        opened={opened}
        onClose={close}
        title={<ModalTitle title={props?.sdk ? t`Update SDK` : t`Create SDK`} icon={IconPuzzle} />}
        zIndex={400}
      >
        <Stack>
          <TextInput withAsterisk label={t`Name`} {...form.getInputProps("name")} />

          <Button
            mt={10}
            loading={isSubmitting}
            onClick={onSubmit}
            leftSection={<IconCheck strokeWidth={1.2} />}
            type="submit"
          >
            {t`Complete`}
          </Button>
        </Stack>
      </Modal>
    </Fragment>
  );
};
