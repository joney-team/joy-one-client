"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { createPartner, updatePartner } from "@/modules/partners/partners-service";
import { PartnerEntity } from "@/modules/partners/partners-types";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { em, Group, Modal, Stack, Text, TextInput, ThemeIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconTopologyStar3, IconUpload } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useState } from "react";

interface ModalParnterFormProps {
  partner?: PartnerEntity;
  onDone?: (partner: PartnerEntity) => Promise<any> | any;
}

export const ModalParnterForm: FC<{
  children: (open: (props?: ModalParnterFormProps) => void) => ReactNode;
}> = ({ children }) => {
  const [props, setProps] = useState<ModalParnterFormProps>();
  const [opened, { open, close }] = useDisclosure(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<File>();
  const uploadFile = useUploadFile();

  const form = useForm({
    initialValues: {
      ...props?.partner,
      name: props?.partner?.name,
      phone: props?.partner?.phone,
      email: props?.partner?.email,
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

    if (avatar) {
      const file = await uploadFile(avatar, { compressSize: 0.3 });
      payload.logo = file.path;
    }

    const action = props?.partner
      ? () => updatePartner(props.partner!._id, payload)
      : () => createPartner(payload);

    await action()
      .then(async (res) => {
        if (props?.onDone) await props.onDone(res);
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
        form.setValues(p?.partner || {});
        open();
      })}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <ModalTitle
            title={props?.partner ? t`Update partner` : t`Create partner`}
            icon={IconTopologyStar3}
          />
        }
        zIndex={400}
      >
        <Stack>
          <Group>
            <Dropzone
              accept={IMAGE_MIME_TYPE}
              onDrop={(files) => {
                setAvatar(files[0]);
              }}
            >
              <Group gap={8} style={{ cursor: "pointer" }}>
                <Avatar
                  src={avatar ? URL.createObjectURL(avatar) : form.values.logo}
                  size={65}
                  fz={10}
                  styles={{
                    placeholder: {
                      fontSize: 10,
                    },
                  }}
                >
                  PT
                </Avatar>

                <Group gap={5}>
                  <ThemeIcon variant="transparent" color="dark" size="md">
                    <IconUpload size={18} strokeWidth={1.2} />
                  </ThemeIcon>
                  <Text fz={em(10)}>{t`Click to change`}</Text>
                </Group>
              </Group>
            </Dropzone>
          </Group>

          <TextInput withAsterisk label={t`Name`} {...form.getInputProps("name")} />
          <TextInput label={t`Phone`} {...form.getInputProps("phone")} />
          <TextInput label="Email" {...form.getInputProps("email")} />

          <Button
            mt={10}
            loading={isSubmitting}
            onClick={onSubmit}
            leftSection={<IconCheck strokeWidth={1.2} />}
            disabled={!form.isDirty() && !avatar}
            type="submit"
          >
            {t`Complete`}
          </Button>
        </Stack>
      </Modal>
    </Fragment>
  );
};
