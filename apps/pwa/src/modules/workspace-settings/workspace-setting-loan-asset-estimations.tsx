"use client";

import { Button } from "@/components/buttons/button";
import { ButtonSelect } from "@/components/buttons/button-select";
import { ContentEditHover } from "@/components/content-edit-hover";
import { Empty } from "@/components/empty";
import { ModalTitle } from "@/components/modal-title";
import { useRouter } from "@/hooks/use-router";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { num } from "@/modules/lang/lang-service";
import { useLoans } from "@/modules/loans/loans-context";
import {
  LoanAssetEstimation,
  LoanAssetEstimations,
  LoanAssetType,
} from "@/modules/loans/loans-types";
import { OnModalLoanAssetEstimationForm } from "@/modules/loans/modals/modal-loan-asset-estimation-form";
import { convertExcelToJson } from "@/modules/tools/tools-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { wait } from "@/utils/common.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { ActionIcon, Card, em, Group, Skeleton, Stack, Table, Text, Tooltip } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { modals } from "@mantine/modals";
import { IconFile, IconFilter, IconPencil, IconPlus, IconX } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { FC, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { loanAssetTypes } from "../loans/loans-constants";

export const WorkspaceSettingLoanAssetEstimations: FC = () => {
  const loans = useLoans();
  const router = useRouter();
  const workspace = useWorkspace();
  const searchs = useSearchParams();

  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(false);

  const limit = 30;
  const [query, setQuery] = useState<{
    take: number;
    brandId?: string;
    modelId?: string;
    productManufacturingDate?: number;
    assetType?: LoanAssetType;
    q?: string;
  }>({ take: limit });

  const importEstimations = async (file: File) => {
    setImporting(true);
    const fileData = await convertExcelToJson(file);

    let data: LoanAssetEstimations = {
      brands: [],
      models: [],
      estimations: [],
      colors: [],
    };

    for (let row of fileData) {
      const rawBrandName = row["Nhãn hiệu"];
      const rawModelName = row["Dòng"];
      const rawProductManufacturingYear = row["Năm sản xuất"];
      const rawAssetType = row["Loại tài sản"];
      const rawProductPrice = row["Giá thẩm định"];
      const rawProductName = row["Tên sản phẩm"];
      const assetType = (
        {
          "XE MÁY": LoanAssetType.MOTOBIKE_REGISTRATION,
          "Ô TÔ": LoanAssetType.CAR_REGISTRATION,
        } as any
      )[rawAssetType];
      if (!assetType) continue;

      let brand = data.brands.find(
        (brand) => brand.name === rawBrandName && brand.assetType === assetType
      );
      if (!brand) {
        brand = { id: data.brands.length.toString(), name: rawBrandName, assetType };
        data.brands.push(brand);
      }

      let model = data.models.find(
        (model) => model.name === rawModelName && model.brandId === brand!.id
      );
      if (!model) {
        model = { id: data.models.length.toString(), name: rawModelName, brandId: brand.id };
        data.models.push(model);
      }

      let estimation: LoanAssetEstimation = {
        id: data.estimations.length.toString(),
        assetType,
        brandId: brand.id,
        modelId: model.id,
        estimatePrice: +rawProductPrice.replace(/,/g, ""),
        productImages: [],
        colorId: "",
        productManufacturingDate: rawProductManufacturingYear
          ? DateTime.toSeconds(new Date(+rawProductManufacturingYear, 0, 1))
          : undefined,
        productName: rawProductName,
      };

      data.estimations.push(estimation);
    }

    await loans.setAssetEstimations(data);
    setImporting(false);
  };

  if (!loans.isInitialized) return <Skeleton height={100} />;

  const list = useMemo(() => {
    return loans.assetEstimations.estimations
      .filter((estimation) => {
        if (searchs.get("assetType")) return estimation.assetType === searchs.get("assetType");
        return true;
      })
      .filter((estimation) => {
        if (searchs.get("brandId")) return estimation.brandId === searchs.get("brandId");
        return true;
      })
      .filter((estimation) => {
        if (searchs.get("modelId")) return estimation.modelId === searchs.get("modelId");
        return true;
      })
      .slice(0, query.take);
  }, [searchs]);

  const isAbleToLoadMore = list.length !== loans.assetEstimations.estimations.length && !loading;

  const fetchMore = async () => {
    if (!isAbleToLoadMore) return;
    setLoading(true);
    setQuery((s) => ({ ...s, take: limit + s.take }));
    await wait(100);
    setLoading(false);
  };

  const assetEstimationPriceSpreadRate =
    (workspace.settings?.loanSettings?.assetEstimationPriceSpreadRate || 100) / 100;

  return (
    <Stack p={16}>
      <Group>
        <Button leftIcon={IconPlus} onClick={() => OnModalLoanAssetEstimationForm({})}>
          Thêm định giá
        </Button>

        <Dropzone
          accept={[MIME_TYPES.xls, MIME_TYPES.xlsx]}
          onDrop={(files) => {
            modals.openConfirmModal({
              title: <ModalTitle color="orange" title="Nhập dữ liệu" icon={IconFile} />,
              children:
                "Dữ liệu hiện tại sẽ bị thay thế bởi dữ liệu mới. Bạn có chắc chắn muốn tiếp tục?",
              color: "orange",
              onConfirm: () => importEstimations(files[0]),
              labels: { confirm: "Tiếp tục", cancel: "Hủy" },
              confirmProps: { color: "orange" },
            });
          }}
        >
          <Button leftIcon={IconFile} loading={importing}>
            Nhập định giá từ file
          </Button>
        </Dropzone>
      </Group>

      <Group>
        <ButtonSelect
          icon={IconFilter}
          label={t`Asset type`}
          iconStrokeWidth={1.8}
          value={searchs.get("assetType")}
          options={[LoanAssetType.CAR_REGISTRATION, LoanAssetType.MOTOBIKE_REGISTRATION].map(
            (v) => ({
              label: loanAssetTypes[v].label(),
              value: v,
            })
          )}
          onChange={(value) => {
            router.setQuery("assetType", value as string, true);
          }}
          onClear={() => router.removeQuery("assetType", true)}
        />

        <ButtonSelect
          icon={IconFilter}
          label={t`Brand name`}
          iconStrokeWidth={1.8}
          value={searchs.get("brandId")}
          options={loans.assetEstimations.brands
            .filter((v) => {
              if (!searchs.get("assetType")) return true;
              return v.assetType === searchs.get("assetType");
            })
            .map((brand) => ({ value: brand.id, label: brand.name }))}
          onChange={(value) => {
            router.setQuery("brandId", value as string, true);
          }}
          onClear={() => router.removeQuery("brandId", true)}
        />

        <ButtonSelect
          icon={IconFilter}
          label={t`Asset model`}
          iconStrokeWidth={1.8}
          value={searchs.get("modelId")}
          options={loans.assetEstimations.models
            .filter((v) => {
              if (!searchs.get("brandId")) return true;
              return v.brandId === searchs.get("brandId");
            })
            .map((brand) => ({ value: brand.id, label: brand.name }))}
          onChange={(value) => {
            router.setQuery("modelId", value as string, true);
          }}
          onClear={() => router.removeQuery("modelId", true)}
        />
      </Group>

      <InfiniteScroll
        loadMore={async () => {
          await fetchMore();
        }}
        hasMore={isAbleToLoadMore}
      >
        {loans.assetEstimations.estimations.length === 0 ? (
          <Empty message={t`No asset estimation`} />
        ) : (
          <Card p={0} shadow="xs">
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>{t`Type`}</Table.Th>
                  <Table.Th>{t`Brand`}</Table.Th>
                  <Table.Th>{t`Model`}</Table.Th>
                  <Table.Th>{t`Name`}</Table.Th>
                  <Table.Th>{t`Manufacturing year`}</Table.Th>
                  <Table.Th>{t`Estimation price`}</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {list.map((estimation, index) => {
                  return (
                    <Table.Tr key={estimation.id}>
                      <Table.Td>{index + 1}</Table.Td>
                      <Table.Td>{loanAssetTypes[estimation.assetType].label()}</Table.Td>
                      <Table.Td>
                        {
                          loans.assetEstimations.brands.find(
                            (brand) => brand.id === estimation.brandId
                          )?.name
                        }
                      </Table.Td>
                      <Table.Td>
                        {
                          loans.assetEstimations.models.find(
                            (model) => model.id === estimation.modelId
                          )?.name
                        }
                      </Table.Td>
                      <Table.Td>{estimation.productName || "--"}</Table.Td>
                      <Table.Td>
                        {estimation.productManufacturingDate
                          ? new Date(estimation.productManufacturingDate * 1000).getFullYear()
                          : "--"}{" "}
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={5}>
                          <ContentEditHover
                            onEdit={() =>
                              OnModalInput({
                                title: "Nhập giá thẩm định",
                                type: InputModalType.NUMBER,
                                onDone: (value) =>
                                  loans.updateEstimation({ ...estimation, estimatePrice: value }),
                                value: estimation.estimatePrice,
                              })
                            }
                          >
                            {num(estimation.estimatePrice, { type: "money" })}
                          </ContentEditHover>

                          {assetEstimationPriceSpreadRate > 0 && (
                            <Tooltip label={t`Display price for users`}>
                              <Text fz={em(13)} c="gray">
                                {num(estimation.estimatePrice * assetEstimationPriceSpreadRate, {
                                  type: "money",
                                })}{" "}
                                ({assetEstimationPriceSpreadRate * 100}%)
                              </Text>
                            </Tooltip>
                          )}
                        </Stack>
                      </Table.Td>

                      <Table.Td w={90}>
                        <Group gap={5}>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => OnModalLoanAssetEstimationForm({ estimation })}
                          >
                            <IconPencil size={18} />
                          </ActionIcon>

                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => loans.removeEstimation(estimation.id)}
                          >
                            <IconX size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Card>
        )}
      </InfiniteScroll>
    </Stack>
  );
};
