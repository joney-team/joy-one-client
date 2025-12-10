"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { ProductComboEntity } from "@/modules/product-combos/product-combos-entity";
import { useProductCombo } from "@/modules/product-combos/product-combos-service";
import { UseProductComboDto } from "@/modules/product-combos/product-combos-types";
import { onFormError } from "@/utils/exceptions.utils";
import { Trans } from "@lingui/react/macro";
import { Center, Modal, NumberInput, Stack, Table, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconPackage } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useRef } from "react";
import { v4 as uuid } from "uuid";

export interface ProductComboUsingModalArgs {
  combo: ProductComboEntity;
}

export const ModalProductComboUsing: FC<{
  children: (open: (args: ProductComboUsingModalArgs) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const propsRef = useRef<ProductComboUsingModalArgs | null>(null);

  const form = useForm<UseProductComboDto>({
    initialValues: {
      ref: "",
      records: [],
    },
  });

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
    <Fragment>
      {children((p) => {
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
      })}

      <Modal
        key={propsRef.current?.combo.id}
        opened={opened}
        onClose={close}
        title={<ModalHead name={<Trans>Add combo history</Trans>} icon={IconPackage} />}
        size="lg"
        yOffset={80}
      >
        <Stack>
          <Table withTableBorder withRowBorders withColumnBorders striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Trans>Product</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Quantity</Trans>
                </Table.Th>
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

          <Textarea label={<Trans>Note</Trans>} {...form.getInputProps("note")} />

          <Center>
            <Button action onClick={() => onSubmit()} loading={form.submitting}>
              <Trans>Add</Trans>
            </Button>
          </Center>
        </Stack>
      </Modal>
    </Fragment>
  );
};
