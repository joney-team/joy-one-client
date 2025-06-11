"use client";

import { type FC, Fragment } from "react";
import { EntityImages } from "@/components/entity-images";
import { TextInput } from "@/components/inputs/text-input";
import { t } from "@/modules/lang/lang-service";
import { LoanAssetType } from "@/modules/loans/loans-types";
import { InputWrapper, SimpleGrid } from "@mantine/core";
import { LoanAssetDataInputProps } from ".";

export const InputICloud: FC<LoanAssetDataInputProps<LoanAssetType.ICLOUD>> = (props) => {
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
