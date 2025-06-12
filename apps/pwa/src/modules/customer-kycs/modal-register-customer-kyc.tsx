"use client";

import { Button } from "@/components/buttons/button";
import { useCamera } from "@/components/camera";
import { EntityImage } from "@/components/entity-image";
import { ModalTitle } from "@/components/modal-title";
import { useFormSubmit } from "@/hooks/use-form";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { onUploadFile } from "@/modules/files/file-service";
import { getDateFormat, t } from "@/modules/lang/lang-service";
import { useLocations } from "@/modules/locations/locations-service";
import { optionsFilter } from "@/modules/theme/generator";
import { detectQrCode } from "@/modules/tools/tools-service";
import { Gender } from "@/types";
import { DateTimeUtils } from "@/utils/dateTime.utils";
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
  ThemeIcon,
  TextInput,
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
import { decodeCid, registerCustomerKyc } from "./customer-kycs-service";
import { CustomerKycDto } from "./customer-kycs-types";

interface ModalRegisterCustomerKycProps {
  customer: CustomerShortInfo;
  onDone?: () => void | Promise<void>;
}

export let OnModalRegisterCustomerKyc: (props: ModalRegisterCustomerKycProps) => void = () => {};

export const ModalRegisterCustomerKyc: FC = () => {
  const camera = useCamera();
  const [locations] = useLocations();
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalRegisterCustomerKycProps>();

  const onClose = async () => close();

  const form = useForm({
    initialValues: {
      cidLocation: {},
    } as any,
    validate: {
      cidNumber: (value: string) => {
        if (!value) return t("required");
        if (value.length !== 12) return t("invalid_cid_number");
      },
      cidFullName: (value: string) => {
        if (!value) return t("required");
      },
      cidLocation: (value: any) => {
        if (!value.provinceId) return t("required");
        if (!value.districtId) return t("required");
        if (!value.address) return t("required");
      },
      cidGender: (value: string) => {
        if (!value) return t("required");
      },
      cidBirthday: (value: number) => {
        if (!value) return t("required");
      },
      cidCreatedAt: (value: number) => {
        if (!value) return t("required");
      },
      frontOfCidImage: (value: File) => {
        if (!value) return t("required");
      },
      backOfCidImage: (value: File) => {
        if (!value) return t("required");
      },
      portraitImage: (value: File) => {
        if (!value) return t("required");
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
        cidLocation: values.cidLocation,
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
      title={<ModalTitle title={t("customer-kyc")} icon={IconUserScan} />}
      onClose={onClose}
      opened={opened}
      yOffset={20}
      size="xl"
    >
      <Stack gap={16}>
        <Session name={t("cidImgs")} icon={IconCards}>
          <Stack gap={10}>
            <SimpleGrid cols={{ md: 2 }}>
              <InputWrapper label={t("frontOfCidImage")}>
                <EntityImage
                  w="100%"
                  src={form.values.frontOfCidImage}
                  onChange={(file) => {
                    form.setFieldValue("frontOfCidImage", file);
                    if (file) detectKyc(file);
                  }}
                />
              </InputWrapper>

              <InputWrapper label={t("backOfCidImage")}>
                <EntityImage
                  w="100%"
                  src={form.values.backOfCidImage}
                  onChange={(file) => {
                    form.setFieldValue("backOfCidImage", file);
                  }}
                />
              </InputWrapper>
            </SimpleGrid>

            <InputWrapper label={t("portraitImage")}>
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

        <Session name={t("cidInfos")} icon={IconInfoCircle}>
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
                {t("scan_qr_code")}
              </Button>

              <Button
                size="xs"
                radius={100}
                leftIcon={IconTextScan2}
                onClick={() =>
                  OnModalInput({
                    title: t("enter_code_string"),
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
                {t("enter_code_string")}
              </Button>
            </Group>

            <TextInput label={t("cidNumber")} {...form.getInputProps("cidNumber")} />

            <SimpleGrid cols={{ md: 2 }}>
              <TextInput label={t("full_name")} {...form.getInputProps("cidFullName")} />

              <Select
                label={t("gender")}
                {...form.getInputProps("cidGender")}
                data={Object.values(Gender).map((v) => ({ value: v, label: t(v) }))}
              />

              <DateInput
                label={t("birthday")}
                valueFormat={getDateFormat()}
                value={DateTimeUtils.secondsToTime(form.values.cidBirthday)}
                onChange={(date) => {
                  if (!date) return;
                  form.setFieldValue("cidBirthday", DateTimeUtils.timeToSeconds(date));
                }}
              />

              <DateInput
                label={t("issuedDate")}
                valueFormat={getDateFormat()}
                value={DateTimeUtils.secondsToTime(form.values.cidCreatedAt)}
                onChange={(date) => {
                  if (!date) return;
                  form.setFieldValue("cidCreatedAt", DateTimeUtils.timeToSeconds(date));
                }}
              />
            </SimpleGrid>

            <InputWrapper label={t("cidMainLocation")}>
              <Card p={8} withBorder>
                <Stack>
                  <Select
                    label={t("province")}
                    {...form.getInputProps(`cidLocation.provinceId`)}
                    searchable
                    data={locations
                      .filter((l) => l.type === "province")
                      .map((l) => ({ value: l.id, label: l.name }))}
                    onChange={(e) => {
                      form.setFieldValue(`cidLocation.provinceId`, e!);
                      form.setFieldValue(`cidLocation.districtId`, "");
                      form.setFieldValue(`cidLocation.wardId`, "");
                    }}
                    filter={optionsFilter}
                  />

                  <Group wrap="nowrap">
                    <Select
                      label={t("district")}
                      {...form.getInputProps("cidLocation.districtId")}
                      searchable
                      data={locations
                        .filter(
                          (l) =>
                            l.type === "district" &&
                            l.parentId === form.values.cidLocation?.provinceId
                        )
                        .map((l) => ({ value: l.id, label: l.fullName }))}
                      onChange={(e) => {
                        form.setFieldValue("cidLocation.districtId", e!);
                        form.setFieldValue("cidLocation.wardId", "");
                      }}
                      flex={1}
                      filter={optionsFilter}
                    />

                    <Select
                      label={t("ward")}
                      {...form.getInputProps("cidLocation.wardId")}
                      searchable
                      data={locations
                        .filter(
                          (l) =>
                            l.type === "ward" && l.parentId === form.values.cidLocation?.districtId
                        )
                        .map((l) => ({ value: l.id, label: l.fullName }))}
                      flex={1}
                      filter={optionsFilter}
                    />
                  </Group>

                  <TextInput label={t("address")} {...form.getInputProps("cidLocation.address")} />
                </Stack>
              </Card>
            </InputWrapper>
          </Stack>
        </Session>

        <Group mt={10} justify="center">
          <Button onClick={submit.handle} type="submit" miw={300} maw="100%">
            {t("complete")}
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

      <Card withBorder p={10}>
        {props.children}
      </Card>
    </Stack>
  );
};
