"use client";

import { EntityImages } from "@/components/entity-images";
import { InputModalType, ModalInput } from "@/modals/modal-input";
import { restClient } from "@/modules/apis/rest-client";
import { useLang } from "@/modules/lang/lang-context";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, InputWrapper, SimpleGrid, TextInput, Tooltip } from "@mantine/core";
import { IconCursorText, IconLockPlus } from "@tabler/icons-react";
import { type FC, Fragment } from "react";
import { LoanAssetDataInputProps } from ".";

export const InputICloud: FC<LoanAssetDataInputProps<"ICLOUD">> = (props) => {
  const lang = useLang();
  const retreiveDeviceKey = async () => {
    const { hash } = await restClient.post("/tools/md5", {
      text: `${props.loanId}-${DateTime.format(new Date(), {
        dateStyle: "short",
        locale: lang.locale,
      })}`,
    });
    props.onChange?.({ ...(props.value as any), deviceSecretKey: hash });
  };

  return (
    <Fragment>
      <SimpleGrid cols={{ md: 2 }}>
        <TextInput
          label={<Trans>Device name</Trans>}
          value={props.value?.deviceName || ""}
          onChange={(event) =>
            props.onChange?.({ ...(props.value as any), deviceName: event.currentTarget.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={<Trans>Asset type</Trans>}
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
          label={<Trans>Serial</Trans>}
          value={props.value?.serial || ""}
          onChange={(event) =>
            props.onChange?.({ ...(props.value as any), serial: event.currentTarget.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={<Trans>Device storage</Trans>}
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
              label={<Trans>Device key</Trans>}
              value={props.value?.deviceSecretKey || ""}
              readOnly
              onChange={(event) =>
                props.onChange?.({
                  ...(props.value as any),
                  deviceSecretKey: event.currentTarget.value,
                })
              }
            />
            <ModalInput>
              {(openInput) => (
                <Tooltip label={<Trans>Enter device key</Trans>}>
                  <ActionIcon
                    size={34}
                    variant="outline"
                    color="gray"
                    onClick={() => {
                      openInput({
                        type: InputModalType.TEXT,
                        onDone: (value) => {
                          props.onChange?.({ ...(props.value as any), deviceSecretKey: value });
                        },
                      });
                    }}
                  >
                    <IconCursorText size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
            </ModalInput>
            <Tooltip label={<Trans>Generate device key</Trans>}>
              <ActionIcon size={34} variant="outline" color="gray" onClick={retreiveDeviceKey}>
                <IconLockPlus size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </SimpleGrid>

      <InputWrapper label={<Trans>Asset images</Trans>}>
        <EntityImages
          name={<Trans>Asset images</Trans>}
          images={props.value?.images}
          onChange={(images) => props.onChange?.({ ...(props.value as any), images })}
          disabled={props.disabled}
        />
      </InputWrapper>
    </Fragment>
  );
};
