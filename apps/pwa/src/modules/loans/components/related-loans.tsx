"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat, RelativeTimeFormat } from "@/components/format/date-format";
import { SectionTitle } from "@/components/session-title";
import { WayPoint } from "@/components/way-point";
import { LoanStatus, SortDirection } from "@/graphql/enums.graphql";
import { useColor } from "@/modules/theme/use-color";
import { useQuery } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Badge, Card, Group, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCreditCardPay } from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState, type FC } from "react";
import LOANS_QUERY, {
  type LoansQuery,
  type LoansQueryVariables,
} from "../graphql/queryLoans.graphql";
import { loanAssetTypes, loanStatuses } from "../loans-constants";
import { Empty } from "@/components/empty";

export const RelatedLoans: FC<{ customerCidNumber: string; ignoreCode?: string }> = ({
  customerCidNumber,
  ignoreCode,
}) => {
  const { t } = useLingui();
  const color = useColor();
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const variables = useMemo<LoansQueryVariables>(() => {
    return {
      customerCidNumber,
      sortCreatedAt: SortDirection.Asc,
    };
  }, [customerCidNumber]);

  const { data, loading, fetchMore } = useQuery<LoansQuery, LoansQueryVariables>(LOANS_QUERY, {
    fetchPolicy: "cache-and-network",
    variables,
  });

  const isAbleFetchingMore = useMemo(() => {
    return !isFetchingMore && data && data.list.results.length < data.list.total && !loading;
  }, [data, isFetchingMore, loading]);

  const onFetchMore = async () => {
    if (!isAbleFetchingMore) return;

    setIsFetchingMore(true);
    await fetchMore({
      variables: {
        ...variables,
        offset: data?.list.results.length ?? 0,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          list: {
            ...prev.list,
            results: [...prev.list.results, ...fetchMoreResult.list.results],
            total: fetchMoreResult.list.total,
          },
        };
      },
    });
    setIsFetchingMore(false);
  };

  const isEmpty = useMemo(() => {
    return !!data && data?.list.results.filter((loan) => ignoreCode !== loan.code).length === 0;
  }, [data]);

  return (
    <Stack gap="xs">
      <SectionTitle name={<Trans>Credit history</Trans>} icon={IconCreditCardPay} />

      {isEmpty && <Empty />}

      {data?.list.results.map((loan) => {
        if (ignoreCode === loan.code) return null;

        const loanAsset = loanAssetTypes[loan.assetType];
        const loanStatus = loanStatuses[loan.status];

        return (
          <Card
            shadow="xs"
            withBorder={false}
            padding="xs"
            component={Link}
            href={`/loans/${loan.code}`}
          >
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon
                size="xl"
                color={
                  loan.status === LoanStatus.Rejected ||
                  loan.status === LoanStatus.Completed ||
                  loan.status === LoanStatus.Fulfilled
                    ? loanStatus.color
                    : color({ light: "dark.1", dark: "dark" })
                }
              >
                <loanAsset.icon size={26} strokeWidth={1.5} />
              </ThemeIcon>

              <Stack gap={3} flex={1}>
                <Group gap="xs" align="center">
                  <Text fw={500} fz="xs">
                    {loan.code}
                  </Text>

                  {loan.createdAt && (
                    <Text fz={10} c="gray">
                      <DateFormat value={loan.createdAt} />
                      {" ("}
                      <RelativeTimeFormat value={loan.createdAt} />
                      {")"}
                    </Text>
                  )}
                </Group>

                <Text fz="sm">
                  <Trans>Loan package</Trans>: <CurrencyFormat value={loan.amount} />
                </Text>
              </Stack>

              <Stack gap={3} align="end">
                <Group gap="xs">
                  {loan.isHasLateInterestReceipt && (
                    <Badge variant="light" color="red">
                      <Trans>Has late interest</Trans>
                    </Badge>
                  )}

                  <Badge variant="light" color={loanStatus.color}>
                    {t(loanStatus.label)}
                  </Badge>
                </Group>

                {loan.rejectReason && loan.status === LoanStatus.Rejected && (
                  <Text fz="xs" c="red" ta="right">
                    {loan.rejectReason}
                  </Text>
                )}
              </Stack>
            </Group>
          </Card>
        );
      })}

      {(isFetchingMore || loading) && <Skeleton width="100%" h={64} />}

      <WayPoint onReached={onFetchMore} enabled={isAbleFetchingMore} />
    </Stack>
  );
};
