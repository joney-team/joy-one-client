"use client";

import { EntityImages } from "@/components/entity-images";
import { api } from "@/modules/apis";
import { t } from "@/modules/lang/lang-service";
import { LoanAssetType } from "@/modules/loans/loans-types";
import { ActionIcon, Group, InputWrapper, SimpleGrid, TextInput, Tooltip } from "@mantine/core";
import { IconCursorText, IconLockPlus } from "@tabler/icons-react";
import { type FC, Fragment } from "react";
import { LoanAssetDataInputProps } from ".";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import dayjs from "dayjs";

export const InputICloud: FC<LoanAssetDataInputProps<LoanAssetType.ICLOUD>> = (props) => {
  const retreiveDeviceKey = async () => {
    const { hash } = await api.post("/tools/md5", {
      text: `${props.loanId}-${dayjs().format("DD/MM/YYYY")}`,
    });
    props.onChange?.({ ...(props.value as any), deviceSecretKey: hash });
  };

  const onInputDeviceKey = () => {
    OnModalInput({
      type: InputModalType.TEXT,
      onDone: (value) => {
        props.onChange?.({ ...(props.value as any), deviceSecretKey: value });
      },
    });
  };

  return (
    <Fragment>
      <SimpleGrid cols={{ md: 2 }}>
        <TextInput
          label={t("device_name")}
          value={props.value?.deviceName || ""}
          onChange={(event) =>
            props.onChange?.({ ...(props.value as any), deviceName: event.currentTarget.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={t("asset_type")}
          value={props.value?.assetType || ""}
          onChange={(event) =>
            props.onChange?.({ ...(props.value as any), assetType: event.currentTarget.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label="IMEIL"
          value={props.value?.imeil || ""}
          onChange={(event) =>
            props.onChange?.({ ...(props.value as any), imeil: event.currentTarget.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label="Serial"
          value={props.value?.serial || ""}
          onChange={(event) =>
            props.onChange?.({ ...(props.value as any), serial: event.currentTarget.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={t("device_storage")}
          value={props.value?.storage || ""}
          onChange={(event) =>
            props.onChange?.({ ...(props.value as any), storage: event.currentTarget.value })
          }
          disabled={props.disabled}
        />

        {props.loanId && (
          <Group align="end" gap={5}>
            <TextInput
              flex={1}
              label={t("device_key")}
              value={props.value?.deviceSecretKey || ""}
              readOnly
              onChange={(event) =>
                props.onChange?.({
                  ...(props.value as any),
                  deviceSecretKey: event.currentTarget.value,
                })
              }
            />
            <Tooltip label={t("enter_device_key")}>
              <ActionIcon size={34} variant="outline" color="gray" onClick={onInputDeviceKey}>
                <IconCursorText size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t("generate_device_key")}>
              <ActionIcon size={34} variant="outline" color="gray" onClick={retreiveDeviceKey}>
                <IconLockPlus size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </SimpleGrid>

      <InputWrapper label={t("asset_imgs")}>
        <EntityImages
          name={t("asset_imgs")}
          images={props.value?.images}
          onChange={(images) => props.onChange?.({ ...(props.value as any), images })}
          disabled={props.disabled}
        />
      </InputWrapper>
    </Fragment>
  );
};
