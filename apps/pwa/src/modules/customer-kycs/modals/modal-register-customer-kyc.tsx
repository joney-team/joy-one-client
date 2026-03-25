"use client";

import { Button } from "@/components/buttons/button";
import { WithCamera } from "@/components/camera";
import { EntityImage } from "@/components/entity-image";
import { ModalHead } from "@/components/modal/modal-head";
import { genders } from "@/constant";
import { CustomerKycInput } from "@/graphql/types.graphql";
import { useFormSubmit } from "@/hooks/use-form";
import { optionsFilter } from "@/modules/theme/generate-theme";
import { detectQrCode } from "@/modules/tools/tools-service";
import { Gender } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Card,
  Group,
  InputWrapper,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  Icon,
  IconCards,
  IconInfoCircle,
  IconQrcode,
  IconTextScan2,
  IconUserScan,
} from "@tabler/icons-react";
import { FC, Fragment, PropsWithChildren, ReactNode, useState } from "react";
import { InputModalType, ModalInput } from "../../../modals/modal-input";
import { CustomerFragment } from "../../customers/graphql/fragmentCustomer.graphql";
import { useUploadFile } from "../../files/hooks/use-upload-file";
import { useLang } from "../../lang/lang-context";
import { useLocations } from "../../locations/locations-context";
import { decodeCid } from "../customer-kycs-service";
import MUTATION_REGISTER_CUSTOMER_KYC from "../graphql/mutationRegisterCustomerKyc.graphql";

interface ModalRegisterCustomerKycArgs {
  customer: CustomerFragment;
  onDone?: () => void | Promise<void>;
}

const Session: FC<PropsWithChildren<{ name: ReactNode; icon: Icon }>> = (props) => {
  return (
    <Stack gap={5}>
      <Group gap={3}>
        <ThemeIcon variant="transparent" radius={100}>
          <props.icon size={20} />
        </ThemeIcon>
        <Text fw={500}>{props.name}</Text>
      </Group>

      <Card withBorder p={10} shadow="none">
        {props.children}
      </Card>
    </Stack>
  );
};

export const WithModalRegisterCustomerKyc: FC<{
  children: (open: (args: ModalRegisterCustomerKycArgs) => void) => ReactNode;
}> = ({ children }) => {
  const lang = useLang();
  const dateFormat = DateTime.getDateFormatString(lang.locale);
  const uploadFile = useUploadFile();
  const { t } = useLingui();

  const { vnLocations } = useLocations();
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalRegisterCustomerKycArgs>();

  const [registerCustomerKyc] = useMutation(MUTATION_REGISTER_CUSTOMER_KYC);

  const onClose = async () => close();

  const form = useForm({
    initialValues: {
      cidVnLocation: {},
    } as any,
    validate: {
      cidNumber: (value: string) => {
        if (!value) return t`Must be provided`;
        if (value.length !== 12) return t`Invalid CID number`;
      },
      cidFullName: (value: string) => {
        if (!value) return t`Must be provided`;
      },
      cidVnLocation: (value: any) => {
        if (!value.provinceId) return t`Must be provided`;
        if (!value.wardId) return t`Must be provided`;
        if (!value.address) return t`Must be provided`;
      },
      cidGender: (value: string) => {
        if (!value) return t`Must be provided`;
      },
      cidBirthday: (value: number) => {
        if (!value) return t`Must be provided`;
      },
      cidCreatedAt: (value: number) => {
        if (!value) return t`Must be provided`;
      },
      frontOfCidImage: (value: File) => {
        if (!value) return t`Must be provided`;
      },
      backOfCidImage: (value: File) => {
        if (!value) return t`Must be provided`;
      },
      portraitImage: (value: File) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const submit = useFormSubmit(form, {
    onSubmit: async (values) => {
      if (!props) return;

      const input: CustomerKycInput = {
        backOfCidImage: await uploadFile(values.backOfCidImage).then((res) => res.path),
        frontOfCidImage: await uploadFile(values.frontOfCidImage).then((res) => res.path),
        portraitImage: await uploadFile(values.portraitImage).then((res) => res.path),
        cidBirthday: values.cidBirthday,
        cidFullName: values.cidFullName,
        cidGender: values.cidGender,
        cidVnLocation: values.cidVnLocation,
        cidNumber: values.cidNumber,
        cidRaw: values.cidRaw,
        cidCreatedAt: values.cidCreatedAt,
      };

      await registerCustomerKyc({
        variables: {
          customerId: props.customer._id,
          input: input,
        },
      });
      await props.onDone?.();
      close();
    },
    onError,
  });

  const detectKyc = async (file: File) => {
    try {
      const qr = await detectQrCode(file);
      if (qr) {
        const cid = decodeCid(qr);
        if (cid) {
          Object.keys(cid).forEach((key) => {
            form.setFieldValue(key, (cid as any)[key]);
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <WithCamera>
      {(camera) => {
        return (
          <Fragment>
            <Modal
              title={<ModalHead name={<Trans>Customer KYC</Trans>} icon={IconUserScan} />}
              onClose={onClose}
              opened={opened}
              yOffset={20}
              size="xl"
            >
              <Stack gap={16}>
                <Session name={<Trans>ID images</Trans>} icon={IconCards}>
                  <Stack gap={10}>
                    <SimpleGrid cols={{ md: 2 }}>
                      <InputWrapper label={<Trans>Front of CID</Trans>}>
                        <EntityImage
                          w="100%"
                          src={form.values.frontOfCidImage}
                          onChange={(file) => {
                            form.setFieldValue("frontOfCidImage", file);
                            if (file) detectKyc(file);
                          }}
                        />
                      </InputWrapper>

                      <InputWrapper label={<Trans>Back of CID</Trans>}>
                        <EntityImage
                          w="100%"
                          src={form.values.backOfCidImage}
                          onChange={(file) => {
                            form.setFieldValue("backOfCidImage", file);
                          }}
                        />
                      </InputWrapper>
                    </SimpleGrid>

                    <InputWrapper label={<Trans>Portrait image</Trans>}>
                      <EntityImage
                        w="100%"
                        src={form.values.portraitImage}
                        onChange={(file) => {
                          form.setFieldValue("portraitImage", file);
                        }}
                      />
                    </InputWrapper>
                  </Stack>
                </Session>

                <Session name={<Trans>CID Infos</Trans>} icon={IconInfoCircle}>
                  <Stack>
                    <Group>
                      <Button
                        size="xs"
                        radius={100}
                        leftIcon={IconQrcode}
                        onClick={() =>
                          camera.onScan({
                            onCaputure: (data) => {
                              console.log("data", data);
                              const cid = decodeCid(data);
                              console.log("cid", cid);
                              return true;
                            },
                          })
                        }
                        variant="light"
                      >
                        <Trans>Scan QR code</Trans>
                      </Button>

                      <ModalInput>
                        {(open) => (
                          <Button
                            size="xs"
                            radius={100}
                            leftIcon={IconTextScan2}
                            onClick={() =>
                              open({
                                title: <Trans>Enter code</Trans>,
                                type: InputModalType.TEXT,
                                onDone(value) {
                                  const cid = decodeCid(value);
                                  Object.keys(cid).forEach((key) => {
                                    form.setFieldValue(key, (cid as any)[key]);
                                  });
                                },
                                icon: IconTextScan2,
                              })
                            }
                            variant="light"
                          >
                            <Trans>Enter code</Trans>
                          </Button>
                        )}
                      </ModalInput>
                    </Group>

                    <TextInput
                      label={<Trans>ID number</Trans>}
                      {...form.getInputProps("cidNumber")}
                    />

                    <SimpleGrid cols={{ md: 2 }}>
                      <TextInput
                        label={<Trans>Full name</Trans>}
                        {...form.getInputProps("cidFullName")}
                      />

                      <Select
                        label={<Trans>Gender</Trans>}
                        {...form.getInputProps("cidGender")}
                        data={Object.values(Gender).map((v) => ({
                          value: v,
                          label: genders[v].name(),
                        }))}
                      />

                      <DateInput
                        label={<Trans>Birthday</Trans>}
                        valueFormat={dateFormat}
                        value={
                          form.values.cidBirthday
                            ? DateTime.normalizeDate(form.values.cidBirthday)
                            : undefined
                        }
                        onChange={(date) => {
                          if (!date) return;
                          form.setFieldValue("cidBirthday", DateTime.toSeconds(date));
                        }}
                      />

                      <DateInput
                        label={<Trans>Issued date</Trans>}
                        valueFormat={dateFormat}
                        value={
                          form.values.cidCreatedAt
                            ? DateTime.normalizeDate(form.values.cidCreatedAt)
                            : undefined
                        }
                        onChange={(date) => {
                          if (!date) return;
                          form.setFieldValue("cidCreatedAt", DateTime.toSeconds(date));
                        }}
                      />
                    </SimpleGrid>

                    <InputWrapper label={<Trans>Main location</Trans>}>
                      <Card p={8} withBorder>
                        <Stack>
                          <SimpleGrid cols={{ base: 1, md: 2 }}>
                            <Select
                              label={<Trans>Province</Trans>}
                              {...form.getInputProps(`cidVnLocation.provinceId`)}
                              searchable
                              data={vnLocations
                                .filter((l) => l.type === "province")
                                .map((l) => ({ value: l.id, label: l.name }))}
                              onChange={(e) => {
                                form.setFieldValue(`cidVnLocation.provinceId`, e!);
                                form.setFieldValue(`cidVnLocation.wardId`, "");
                              }}
                              filter={optionsFilter}
                            />

                            <Select
                              label={<Trans>Ward</Trans>}
                              {...form.getInputProps("cidVnLocation.wardId")}
                              searchable
                              data={vnLocations
                                .filter(
                                  (l) =>
                                    l.type === "ward" &&
                                    l.parentId === form.values.cidVnLocation?.provinceId &&
                                    form.values.cidVnLocation?.provinceId,
                                )
                                .map((l) => ({ value: l.id, label: l.fullName }))}
                              flex={1}
                              filter={optionsFilter}
                            />
                          </SimpleGrid>

                          <TextInput
                            label={<Trans>Address</Trans>}
                            {...form.getInputProps("cidVnLocation.address")}
                          />
                        </Stack>
                      </Card>
                    </InputWrapper>
                  </Stack>
                </Session>

                <Group mt={10} justify="center">
                  <Button onClick={() => submit.handle()} type="submit" miw={300} maw="100%">
                    <Trans>Complete</Trans>
                  </Button>
                </Group>
              </Stack>
            </Modal>

            {children((p) => {
              setProps(p);
              form.reset();
              open();
            })}
          </Fragment>
        );
      }}
    </WithCamera>
  );
};
