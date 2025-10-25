"use client";

import { Button } from "@/components/buttons/button";
import { useCamera } from "@/components/camera";
import { EntityImage } from "@/components/entity-image";
import { ModalTitle } from "@/components/modal-title";
import { useFormSubmit } from "@/hooks/use-form";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { onUploadFile } from "@/modules/files/file-service";
import { getDateFormat, tl } from "@/modules/lang/lang-service";
import { optionsFilter } from "@/modules/theme/generator";
import { detectQrCode } from "@/modules/tools/tools-service";
import { Gender } from "@/types";
import { DateTime } from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
import {
  Card,
  em,
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
import { FC, PropsWithChildren, useState } from "react";
import { InputModalType, OnModalInput } from "../../modals/modal-input";
import { useLocations } from "../locations/locations-context";
import { decodeCid, registerCustomerKyc } from "./customer-kycs-service";
import { CustomerKycDto } from "./customer-kycs-types";

interface ModalRegisterCustomerKycProps {
  customer: CustomerShortInfo;
  onDone?: () => void | Promise<void>;
}

export let OnModalRegisterCustomerKyc: (props: ModalRegisterCustomerKycProps) => void = () => {};

export const ModalRegisterCustomerKyc: FC = () => {
  const camera = useCamera();
  const { vnLocations } = useLocations();
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalRegisterCustomerKycProps>();

  const onClose = async () => close();

  const form = useForm({
    initialValues: {
      cidVnLocation: {},
    } as any,
    validate: {
      cidNumber: (value: string) => {
        if (!value) return tl("required");
        if (value.length !== 12) return tl("invalid_cid_number");
      },
      cidFullName: (value: string) => {
        if (!value) return tl("required");
      },
      cidVnLocation: (value: any) => {
        if (!value.provinceId) return tl("required");
        if (!value.wardId) return tl("required");
        if (!value.address) return tl("required");
      },
      cidGender: (value: string) => {
        if (!value) return tl("required");
      },
      cidBirthday: (value: number) => {
        if (!value) return tl("required");
      },
      cidCreatedAt: (value: number) => {
        if (!value) return tl("required");
      },
      frontOfCidImage: (value: File) => {
        if (!value) return tl("required");
      },
      backOfCidImage: (value: File) => {
        if (!value) return tl("required");
      },
      portraitImage: (value: File) => {
        if (!value) return tl("required");
      },
    },
  });

  OnModalRegisterCustomerKyc = async (p) => {
    setProps(p);
    form.reset();
    open();
  };

  const submit = useFormSubmit(form, {
    onSubmit: async (values) => {
      if (!props) return;

      const dto: CustomerKycDto = {
        backOfCidImage: await onUploadFile({ file: values.backOfCidImage }).then(
          (res) => res.relativePath
        ),
        frontOfCidImage: await onUploadFile({ file: values.frontOfCidImage }).then(
          (res) => res.relativePath
        ),
        portraitImage: await onUploadFile({ file: values.portraitImage }).then(
          (res) => res.relativePath
        ),
        cidBirthday: values.cidBirthday,
        cidFullName: values.cidFullName,
        cidGender: values.cidGender,
        cidVnLocation: values.cidVnLocation,
        cidNumber: values.cidNumber,
        cidRaw: values.cidRaw,
        cidCreatedAt: values.cidCreatedAt,
      };

      await registerCustomerKyc(props.customer._id, dto);
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
    <Modal
      title={<ModalTitle title={tl("customer-kyc")} icon={IconUserScan} />}
      onClose={onClose}
      opened={opened}
      yOffset={20}
      size="xl"
    >
      <Stack gap={16}>
        <Session name={tl("cidImgs")} icon={IconCards}>
          <Stack gap={10}>
            <SimpleGrid cols={{ md: 2 }}>
              <InputWrapper label={tl("frontOfCidImage")}>
                <EntityImage
                  w="100%"
                  src={form.values.frontOfCidImage}
                  onChange={(file) => {
                    form.setFieldValue("frontOfCidImage", file);
                    if (file) detectKyc(file);
                  }}
                />
              </InputWrapper>

              <InputWrapper label={tl("backOfCidImage")}>
                <EntityImage
                  w="100%"
                  src={form.values.backOfCidImage}
                  onChange={(file) => {
                    form.setFieldValue("backOfCidImage", file);
                  }}
                />
              </InputWrapper>
            </SimpleGrid>

            <InputWrapper label={tl("portraitImage")}>
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

        <Session name={tl("cidInfos")} icon={IconInfoCircle}>
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
                fz={em(14)}
              >
                {tl("scan_qr_code")}
              </Button>

              <Button
                size="xs"
                radius={100}
                leftIcon={IconTextScan2}
                onClick={() =>
                  OnModalInput({
                    title: tl("enter_code_string"),
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
                fz={em(14)}
              >
                {tl("enter_code_string")}
              </Button>
            </Group>

            <TextInput label={tl("cidNumber")} {...form.getInputProps("cidNumber")} />

            <SimpleGrid cols={{ md: 2 }}>
              <TextInput label={tl("full_name")} {...form.getInputProps("cidFullName")} />

              <Select
                label={tl("gender")}
                {...form.getInputProps("cidGender")}
                data={Object.values(Gender).map((v) => ({ value: v, label: tl(v) }))}
              />

              <DateInput
                label={tl("birthday")}
                valueFormat={getDateFormat()}
                value={DateTime.secondsToTime(form.values.cidBirthday)}
                onChange={(date) => {
                  if (!date) return;
                  form.setFieldValue("cidBirthday", DateTime.timeToSeconds(date));
                }}
              />

              <DateInput
                label={tl("issuedDate")}
                valueFormat={getDateFormat()}
                value={DateTime.secondsToTime(form.values.cidCreatedAt)}
                onChange={(date) => {
                  if (!date) return;
                  form.setFieldValue("cidCreatedAt", DateTime.timeToSeconds(date));
                }}
              />
            </SimpleGrid>

            <InputWrapper label={tl("cidMainLocation")}>
              <Card p={8} withBorder>
                <Stack>
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <Select
                      label={tl("province")}
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
                      label={tl("ward")}
                      {...form.getInputProps("cidVnLocation.wardId")}
                      searchable
                      data={vnLocations
                        .filter(
                          (l) =>
                            l.type === "ward" &&
                            l.parentId === form.values.cidVnLocation?.provinceId &&
                            form.values.cidVnLocation?.provinceId
                        )
                        .map((l) => ({ value: l.id, label: l.fullName }))}
                      flex={1}
                      filter={optionsFilter}
                    />
                  </SimpleGrid>

                  <TextInput
                    label={tl("address")}
                    {...form.getInputProps("cidVnLocation.address")}
                  />
                </Stack>
              </Card>
            </InputWrapper>
          </Stack>
        </Session>

        <Group mt={10} justify="center">
          <Button onClick={submit.handle} type="submit" miw={300} maw="100%">
            {tl("complete")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

const Session: FC<PropsWithChildren<{ name: string; icon: Icon }>> = (props) => {
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
