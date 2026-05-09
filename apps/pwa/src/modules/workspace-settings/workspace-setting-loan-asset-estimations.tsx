"use client";

import { Button } from "@/components/buttons/button";
import { ButtonSelect } from "@/components/buttons/button-select";
import { ContentEditHover } from "@/components/content-edit-hover";
import { Empty } from "@/components/empty";
import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { LoanAssetType } from "@/graphql/enums.graphql";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { useRouter } from "@/hooks/use-router";
import { InputModalType, ModalInput } from "@/modals/modal-input";
import { LoanAssetEstimation, LoanAssetEstimations } from "@/modules/loans/loans-types";
import { ModalLoanAssetEstimationForm } from "@/modules/loans/modals/modal-loan-asset-estimation-form";
import { convertExcelToJson } from "@/modules/tools/tools-service";
import { wait } from "@/utils/common.utils";
import { DateTime } from "@joy-one/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Card, em, Group, Skeleton, Stack, Table, Text, Tooltip } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import {
  IconFile,
  IconFileImport,
  IconFilter,
  IconPencil,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { FC, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useLoanAssetEstimations } from "../loans/hooks/use-loan-asset-estimations";
import { loanAssetTypes } from "../loans/loans-constants";
import { useWorkspaceSetting } from "./hooks/use-workspace-setting";

export const WorkspaceSettingLoanAssetEstimations: FC = () => {
  const {
    assetEstimations,
    setAssetEstimations,
    loading: assetEstimationsLoading,
    updateEstimation,
    removeEstimation,
  } = useLoanAssetEstimations();

  const router = useRouter();
  const searchs = useSearchParams();
  const { t } = useLingui();
  const { workspaceSetting } = useWorkspaceSetting();

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
    const File = await convertExcelToJson(file);

    let data: LoanAssetEstimations = {
      __typename: "LoanAssetEstimations",
      id: "0",
      brands: [],
      models: [],
      estimations: [],
      colors: [],
    };

    for (let row of File) {
      const rawBrandName = row["Nhãn hiệu"];
      const rawModelName = row["Dòng"];
      const rawProductManufacturingYear = row["Năm sản xuất"];
      const rawAssetType = row["Loại tài sản"];
      const rawProductPrice = row["Giá thẩm định"];
      const rawProductName = row["Tên sản phẩm"];
      const assetType = (
        {
          "XE MÁY": LoanAssetType.MotobikeRegistration,
          "Ô TÔ": LoanAssetType.CarRegistration,
        } as any
      )[rawAssetType];
      if (!assetType) continue;

      let brand = data.brands.find(
        (brand) => brand.name === rawBrandName && brand.assetType === assetType,
      );
      if (!brand) {
        brand = { id: data.brands.length.toString(), name: rawBrandName, assetType };
        data.brands.push(brand);
      }

      let model = data.models.find(
        (model) => model.name === rawModelName && model.brandId === brand!.id,
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

    await setAssetEstimations(data);
    setImporting(false);
  };

  const list = useMemo(() => {
    return (assetEstimations?.estimations ?? [])
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
  }, [searchs, assetEstimations?.estimations, query.take]);

  const isAbleToLoadMore = list.length !== (assetEstimations?.estimations ?? []).length && !loading;

  const fetchMore = async () => {
    if (!isAbleToLoadMore) return;
    setLoading(true);
    setQuery((s) => ({ ...s, take: limit + s.take }));
    await wait(100);
    setLoading(false);
  };

  const assetEstimationPriceSpreadRate =
    (workspaceSetting?.loanSettings?.assetEstimationPriceSpreadRate || 100) / 100;

  if (assetEstimationsLoading) return <Skeleton height={100} />;
  if (!assetEstimations) return null;

  return (
    <ModalLoanAssetEstimationForm>
      {(openLoanAssetEstimationForm) => (
        <Stack p="md">
          <Group>
            <Button leftIcon={IconPlus} onClick={() => openLoanAssetEstimationForm()}>
              <Trans>Add asset estimation</Trans>
            </Button>

            <Dropzone
              accept={[MIME_TYPES.xls, MIME_TYPES.xlsx]}
              onDrop={(files) => {
                onConfirmModal({
                  title: <Trans>Import asset estimations</Trans>,
                  icon: IconFileImport,
                  content: <Trans>Are you sure you want to import the asset estimations?</Trans>,
                  type: "warning",
                  onConfirm: () => importEstimations(files[0]),
                });
              }}
            >
              <Button leftIcon={IconFile} loading={importing}>
                <Trans>Import asset estimations from file</Trans>
              </Button>
            </Dropzone>
          </Group>

          <Group>
            <ButtonSelect
              icon={IconFilter}
              label={<Trans>Asset type</Trans>}
              iconStrokeWidth={1.8}
              value={searchs.get("assetType")}
              options={[LoanAssetType.CarRegistration, LoanAssetType.MotobikeRegistration].map(
                (v) => ({
                  label: t(loanAssetTypes[v].label),
                  value: v,
                }),
              )}
              onChange={(value) => {
                router.setQuery("assetType", value as string, true);
              }}
              onClear={() => router.removeQuery("assetType", true)}
            />

            <ButtonSelect
              icon={IconFilter}
              label={<Trans>Brand name</Trans>}
              iconStrokeWidth={1.8}
              value={searchs.get("brandId")}
              options={assetEstimations.brands
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
              label={<Trans>Asset model</Trans>}
              iconStrokeWidth={1.8}
              value={searchs.get("modelId")}
              options={assetEstimations.models
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
            {assetEstimations.estimations.length === 0 ? (
              <Empty message={t`No asset estimation`} />
            ) : (
              <Card p={0} shadow="xs">
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>#</Table.Th>
                      <Table.Th>
                        <Trans>Type</Trans>
                      </Table.Th>
                      <Table.Th>
                        <Trans>Brand</Trans>
                      </Table.Th>
                      <Table.Th>
                        <Trans>Model</Trans>
                      </Table.Th>
                      <Table.Th>
                        <Trans>Name</Trans>
                      </Table.Th>
                      <Table.Th>
                        <Trans>Manufacturing year</Trans>
                      </Table.Th>
                      <Table.Th>
                        <Trans>Estimation price</Trans>
                      </Table.Th>
                      <Table.Th></Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {list.map((estimation, index) => {
                      return (
                        <Table.Tr key={estimation.id}>
                          <Table.Td>{index + 1}</Table.Td>
                          <Table.Td>{t(loanAssetTypes[estimation.assetType].label)}</Table.Td>
                          <Table.Td>
                            {
                              assetEstimations.brands.find(
                                (brand) => brand.id === estimation.brandId,
                              )?.name
                            }
                          </Table.Td>
                          <Table.Td>
                            {
                              assetEstimations.models.find(
                                (model) => model.id === estimation.modelId,
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
                              <ModalInput>
                                {(openInput) => (
                                  <ContentEditHover
                                    onEdit={() =>
                                      openInput({
                                        title: "Nhập giá thẩm định",
                                        type: InputModalType.NUMBER,
                                        onDone: (value) =>
                                          updateEstimation({
                                            ...estimation,
                                            estimatePrice: value,
                                          }),
                                        value: estimation.estimatePrice,
                                      })
                                    }
                                  >
                                    <CurrencyFormat value={estimation.estimatePrice} />
                                  </ContentEditHover>
                                )}
                              </ModalInput>

                              {assetEstimationPriceSpreadRate > 0 && (
                                <Tooltip label={<Trans>Display price for users</Trans>}>
                                  <Text fz={em(13)} c="gray">
                                    <CurrencyFormat
                                      value={
                                        estimation.estimatePrice * assetEstimationPriceSpreadRate
                                      }
                                    />
                                    (
                                    <NumberFormat
                                      value={assetEstimationPriceSpreadRate * 100}
                                      suffix="%"
                                    />
                                    )
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
                                onClick={() => openLoanAssetEstimationForm({ estimation })}
                              >
                                <IconPencil size={18} />
                              </ActionIcon>

                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => removeEstimation(estimation.id)}
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
      )}
    </ModalLoanAssetEstimationForm>
  );
};
