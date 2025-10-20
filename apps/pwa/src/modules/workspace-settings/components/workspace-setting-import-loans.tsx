import { Button } from "@/components/buttons/button";
import { useColor } from "@/modules/theme/use-color";
import { EntitySource } from "@/types";
import { createCustomer, isCustomerPhoneExisted } from "@/modules/customers/customer-service";
import { CustomerDto } from "@/modules/customers/customer-types";
import { ImportLoanDto } from "@/modules/loans/loan-dtos";
import { String } from "@/utils/string.utils";
import { ActionIcon, Card, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconFileImport, IconFileTypeJs, IconX } from "@tabler/icons-react";
import { FC, useRef, useState } from "react";

interface Result {
  customers: {
    created: number;
    existed: number;
    failed: number;
  };
  loans: {
    created: number;
    failed: number;
  };
}

export const WorkspaceSettingImportLoans: FC = () => {
  const [loansFile, setLoansFile] = useState<File | null>(null);
  const [customersFile, setCustomersFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const normalizeCustomerDtos = (rawCustomers: any[]): CustomerDto[] => {
    if (!Array.isArray(rawCustomers)) throw new Error("Dữ liệu khách hàng không hợp lệ");
    try {
      return rawCustomers.reduce((acc, c) => {
        const id = c.data.find((d: any) => d.Id)?.Id;
        const phone = c.data.find((d: any) => d.Mobile && !d.Mobile.includes("*"))?.Mobile;
        const address = c.data.find((d: any) => d.Address && !d.Address.includes("*"))?.Address;
        const createdAt = c.data.find(
          (d: any) => d.CreatedTime && !d.CreatedTime.includes("*")
        )?.CreatedTime;

        if (id && phone && address) {
          const data: CustomerDto = {
            plainCode: id.toString(),
            name: c.name,
            phone: phone.split("/")[0].trim(),
            location: {
              address,
            },
            createdAt: createdAt
              ? +((createdAt as string).match(/Date\((\d+)\)/)?.[1] ?? 0)
              : undefined,
            source: EntitySource.IMPORT,
          };

          acc.push(data);
        }

        return acc;
      }, []);
    } catch (error) {
      console.error(error);
      throw new Error("Dữ liệu khách hàng không thể xử lí do kiểu dữ liệu không hợp lệ");
    }
  };

  const normalizeLoanDtos = (rawLoans: any[]): ImportLoanDto[] => {
    return rawLoans.reduce((dtos, rawLoan) => {
      // return {
      //   ...l,
      //   createdAt: l.CreatedTime ? +((l.CreatedTime as string).match(/Date\((\d+)\)/)?.[1] ?? 0) : undefined,
      //   status: LoanStatus.PENDING,
      // }

      return dtos;
    }, []);
  };

  const onProcess = async () => {
    setResult(null);
    let result: Result = {
      customers: {
        created: 0,
        existed: 0,
        failed: 0,
      },
      loans: {
        created: 0,
        failed: 0,
      },
    };

    const customerDtos = customersFile
      ? await customersFile.text().then(JSON.parse).then(normalizeCustomerDtos)
      : null;
    if (customerDtos) {
      for (const dto of customerDtos) {
        const isExisted = await isCustomerPhoneExisted(dto.phone);

        if (isExisted) {
          result.customers.existed++;
          continue;
        }

        await createCustomer(dto)
          .then(() => {
            result.customers.created++;
          })
          .catch(() => {
            result.customers.failed++;
          });
      }
    }

    setResult(result);
  };

  return (
    <Stack>
      <SimpleGrid cols={{ md: 2 }}>
        <DropzoneCard file={customersFile} setFile={setCustomersFile} name="Hồ sơ khách hàng" />

        <DropzoneCard file={loansFile} setFile={setLoansFile} name="Hồ sơ vay" />
      </SimpleGrid>

      {result && (
        <Stack gap={3}>
          <Text fw={600}>Kết quả</Text>
          <Text>Khách hàng đã nhập: {result.customers.created}</Text>
          <Text>Khách hàng đã tồn tại: {result.customers.existed}</Text>
          <Text>Khách hàng nhập thất bại: {result.customers.failed}</Text>

          <Text>Hồ sơ vay đã nhập: {result.loans.created}</Text>
          <Text>Hồ sơ vay nhập thất bại: {result.loans.failed}</Text>
        </Stack>
      )}

      <Group justify="center">
        <Button leftIcon={IconFileImport} onClick={onProcess}>
          Nhập dữ liệu
        </Button>
      </Group>
    </Stack>
  );
};

const DropzoneCard: FC<{
  file: File | null;
  name: string;
  setFile: (file: File | null) => void;
}> = ({ file, setFile, name }) => {
  const color = useColor();
  const openRef = useRef<() => void>(null);

  return (
    <Dropzone
      multiple={false}
      onDrop={(files) => setFile(files[0])}
      accept={["application/json"]}
      activateOnClick={false}
      openRef={openRef}
    >
      <Card
        shadow="none"
        withBorder
        pos="relative"
        style={{
          borderStyle: file ? "solid" : "dashed",
          borderColor: color(file ? "primary" : "dimmed"),
        }}
      >
        <Group className="clickable" align="center" gap={8} onClick={() => openRef.current?.()}>
          <Dropzone.Idle>
            <IconFileTypeJs size={52} stroke={1.2} color={color(file ? "primary" : "dimmed")} />
          </Dropzone.Idle>

          <Stack gap={3}>
            <Text c={color(file ? "primary" : "dimmed")} fw={600}>
              {name}
            </Text>
            {file ? (
              <Text c="dimmed" fz={13}>
                {String.limitCharacters(file.name, 20)}
              </Text>
            ) : (
              <Text c="dimmed" fz={13}>
                Bấm để tải lên hoặc thả file vào đây.
              </Text>
            )}
          </Stack>
        </Group>

        {file && (
          <ActionIcon
            variant="subtle"
            color="gray"
            size={24}
            pos="absolute"
            top={3}
            right={3}
            onClick={() => setFile(null)}
          >
            <IconX size={16} />
          </ActionIcon>
        )}
      </Card>
    </Dropzone>
  );
};
