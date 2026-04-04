"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { PartnerInput } from "@/graphql/types.graphql";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { em, Group, Modal, Stack, Text, TextInput, ThemeIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconTopologyStar3, IconUpload } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useState } from "react";
import CreatePartnerDocument from "../graphql/createPartner.graphql";
import { PartnerFragment } from "../graphql/fragmentPartner.graphql";
import UpdatePartnerDocument from "../graphql/updatePartner.graphql";

interface ModalParnterFormProps {
  partner?: PartnerFragment;
  onDone?: (partner: PartnerFragment) => Promise<any> | any;
}

export const ModalParnterForm: FC<{
  children: (open: (props?: ModalParnterFormProps) => void) => ReactNode;
}> = ({ children }) => {
  const client = useApolloClient();
  const { t } = useLingui();
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

    const input: PartnerInput = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      logo: avatar
        ? await uploadFile(avatar, { compressSize: 0.3 }).then((result) => result.path)
        : values.logo,
    };

    const action = props?.partner
      ? () =>
          client.mutate({
            mutation: UpdatePartnerDocument,
            variables: {
              partnerId: props.partner?._id!,
              input,
            },
          })
      : () =>
          client.mutate({
            mutation: CreatePartnerDocument,
            variables: {
              input,
            },
          });

    await action()
      .then(async (res) => {
        if (props?.onDone) await props.onDone(res.data?.partner!);
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
          <ModalHead
            name={props?.partner ? <Trans>Update partner</Trans> : <Trans>Create partner</Trans>}
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
                  <Text fz={em(10)}>
                    <Trans>Click to change</Trans>
                  </Text>
                </Group>
              </Group>
            </Dropzone>
          </Group>

          <TextInput withAsterisk label={<Trans>Name</Trans>} {...form.getInputProps("name")} />
          <TextInput label={<Trans>Phone</Trans>} {...form.getInputProps("phone")} />
          <TextInput label={<Trans>Email</Trans>} {...form.getInputProps("email")} />

          <Button
            mt={10}
            loading={isSubmitting}
            onClick={() => onSubmit()}
            leftSection={<IconCheck strokeWidth={1.2} />}
            disabled={!form.isDirty() && !avatar}
            type="submit"
          >
            <Trans>Complete</Trans>
          </Button>
        </Stack>
      </Modal>
    </Fragment>
  );
};
