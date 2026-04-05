"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { UseProductComboInput } from "@/graphql/types.graphql";
import { onFormError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Center, NumberInput, Stack, Table, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconPackage } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useRef } from "react";
import { v4 as uuid } from "uuid";
import { ProductComboFragment } from "../graphql/fragmentProductCombo.graphql";
import UseProductComboDocument from "../graphql/useProductCombo.graphql";
import { Modal } from "@/components/modal/modal";

export interface ProductComboUsingModalArgs {
  combo: ProductComboFragment;
}

export const ModalProductComboUsing: FC<{
  children: (open: (args: ProductComboUsingModalArgs) => void) => ReactNode;
}> = ({ children }) => {
  const client = useApolloClient();
  const [opened, { open, close }] = useDisclosure(false);
  const propsRef = useRef<ProductComboUsingModalArgs | null>(null);

  const form = useForm<UseProductComboInput>({
    initialValues: {
      ref: "",
      records: [],
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const availableRecords = values.records.filter((record) => record.quantity !== 0);
      if (availableRecords.length === 0 || !propsRef.current?.combo.id) return close();

      await client.mutate({
        mutation: UseProductComboDocument,
        variables: {
          useProductComboId: propsRef.current.combo.id,
          input: {
            ...values,
            ref: values.ref || uuid(),
            records: availableRecords,
          },
        },
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
        name={<Trans>Add combo history</Trans>}
        icon={IconPackage}
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
                  (ref) => ref.productRefId === record.productRefId,
                )?.product;

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
            <Button onClick={() => onSubmit()} loading={form.submitting}>
              <Trans>Add</Trans>
            </Button>
          </Center>
        </Stack>
      </Modal>
    </Fragment>
  );
};
