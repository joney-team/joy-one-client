"use client";

import { EntityImages } from "@/components/entity-images";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { api } from "@/modules/apis";
import { LoanAssetType } from "@/modules/loans/loans-types";
import { t } from "@lingui/core/macro";
import { ActionIcon, Group, InputWrapper, SimpleGrid, TextInput, Tooltip } from "@mantine/core";
import { IconCursorText, IconLockPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { type FC, Fragment } from "react";
import { LoanAssetDataInputProps } from ".";

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
          label={t`Device name`}
          value={props.value?.deviceName || ""}
          onChange={(event) =>
            props.onChange?.({ ...(props.value as any), deviceName: event.currentTarget.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={t`Asset type`}
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
          label={t`Serial`}
          value={props.value?.serial || ""}
          onChange={(event) =>
            props.onChange?.({ ...(props.value as any), serial: event.currentTarget.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={t`Device storage`}
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
              label={t`Device key`}
              value={props.value?.deviceSecretKey || ""}
              readOnly
              onChange={(event) =>
                props.onChange?.({
                  ...(props.value as any),
                  deviceSecretKey: event.currentTarget.value,
                })
              }
            />
            <Tooltip label={t`Enter device key`}>
              <ActionIcon size={34} variant="outline" color="gray" onClick={onInputDeviceKey}>
                <IconCursorText size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Generate device key`}>
              <ActionIcon size={34} variant="outline" color="gray" onClick={retreiveDeviceKey}>
                <IconLockPlus size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </SimpleGrid>

      <InputWrapper label={t`Asset images`}>
        <EntityImages
          name={t`Asset images`}
          images={props.value?.images}
          onChange={(images) => props.onChange?.({ ...(props.value as any), images })}
          disabled={props.disabled}
        />
      </InputWrapper>
    </Fragment>
  );
};
