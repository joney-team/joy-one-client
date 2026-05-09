"use client";

import { NavigationTabs } from "@/components/navigation-tabs";
import { LoanStatus } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { renderLoanList } from "@/modules/loans/loan-list";
import { useLingui } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import {
  IconAnalyze,
  IconClockExclamation,
  IconPlayerRecord,
  IconStack2,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { FC, useMemo } from "react";

export const LoanListTabs: FC = () => {
  const { t } = useLingui();
  const router = useRouter();
  const searchs = useSearchParams();

  const tabs = useMemo(
    () => [
      {
        value: "active",
        icon: IconPlayerRecord,
        label: t`Active`,
        isShowCount: true,
        components: renderLoanList({
          strictStatus: [LoanStatus.Fulfilled],
          count: (reports) => reports.metrics?.data.loans.contracts.activated || 0,
        }),
      },
      {
        value: "processing",
        icon: IconAnalyze,
        label: t`Processing`,
        isShowCount: true,
        components: renderLoanList({
          strictStatus: [LoanStatus.PendingSign, LoanStatus.Pending, LoanStatus.Approved],
          counterColor: "orange.7",
          count: (reports) => reports.metrics?.data.loans.contracts.pending || 0,
        }),
      },
      {
        value: "overdue",
        label: t`Overdue`,
        isShowCount: true,
        icon: IconClockExclamation,
        components: renderLoanList({
          strictStatus: [LoanStatus.Overdue],
          counterColor: "red.8",
          count: (reports) => reports.metrics?.data.loans.contracts.overdue || 0,
        }),
      },
      {
        value: "all",
        label: t`All`,
        icon: IconStack2,
        components: renderLoanList(),
      },
    ],
    [t],
  );

  const activeTabId = searchs.get("ltab") || "active";
  const activeTab = tabs.find((t) => t.value === activeTabId);

  return (
    <Stack>
      <NavigationTabs
        activeTab={activeTabId}
        onChange={(e) => {
          if (!e || e === tabs[0].value) router.replace("/loans");
          else router.replace(`/loans?ltab=${e}`);
        }}
        tabs={tabs.map((t) => ({
          id: t.value,
          name: t.label,
          icon: t.icon,
          exact: true,
          rightSection: t.isShowCount && <t.components.count key={t.value} />,
        }))}
      />

      <Stack px={16} pb={16}>
        {activeTab && <activeTab.components.list key={activeTabId} />}
      </Stack>
    </Stack>
  );
};
