"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { ProductComboEntity } from "@/modules/product-combos/product-combos-entity";
import { useProductCombo } from "@/modules/product-combos/product-combos-service";
import { UseProductComboDto } from "@/modules/product-combos/product-combos-types";
import { onFormError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Center, Modal, NumberInput, Stack, Table, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconPackage } from "@tabler/icons-react";
import { FC, useRef } from "react";
import { v4 as uuid } from "uuid";

export interface ProductComboUsingModalProps {
  combo: ProductComboEntity;
}

export let OnModalProductComboUsing: (props: ProductComboUsingModalProps) => void = () => {};

export const ModalProductComboUsing: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const propsRef = useRef<ProductComboUsingModalProps | null>(null);

  const form = useForm<UseProductComboDto>({
    initialValues: {
      ref: "",
      records: [],
    },
  });

  OnModalProductComboUsing = (p) => {
    propsRef.current = p;
    form.setInitialValues({
      ref: p.combo.id,
      records: p.combo.productRefs.map((ref) => ({
        productRefId: ref.productRefId,
        quantity: 0,
      })),
      note: "",
    });
    form.reset();
    open();
  };

  const onSubmit = form.onSubmit(async (dto) => {
    try {
      const availableRecords = dto.records.filter((record) => record.quantity !== 0);
      if (availableRecords.length === 0) return close();

      await useProductCombo(propsRef.current!.combo.id, {
        ...dto,
        ref: dto.ref || uuid(),
        records: availableRecords,
      });
      close();
    } catch (error) {
      onFormError(form, error);
    }
  });

  return (
    <Modal
      key={propsRef.current?.combo.id}
      opened={opened}
      onClose={close}
      title={<ModalTitle title={t`Add combo history`} icon={IconPackage} />}
      size="lg"
      yOffset={80}
    >
      <Stack>
        <Table withTableBorder withRowBorders withColumnBorders striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t`Product`}</Table.Th>
              <Table.Th>{t`Quantity`}</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {form.values.records.map((record, index) => {
              const product = propsRef.current!.combo.productRefs.find(
                (ref) => ref.productRefId === record.productRefId
              )?.productRef;

              return (
                <Table.Tr key={record.productRefId}>
                  <Table.Td>{product?.name}</Table.Td>

                  <Table.Td>
                    <NumberInput {...form.getInputProps(`records.${index}.quantity`)} />
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>

        <Textarea label={t`Note`} {...form.getInputProps("note")} />

        <Center>
          <Button action onClick={onSubmit} loading={form.submitting}>
            <Trans>Add</Trans>
          </Button>
        </Center>
      </Stack>
    </Modal>
  );
};
