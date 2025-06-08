"use client";

import { NavigationTabs } from "@/components/navigation-tabs";
import { useRouter } from "@/hooks/use-router";
import { t } from "@/modules/lang/lang-service";
import { renderLoanList } from "@/modules/loans/loan-list";
import { LoanStatus } from "@/modules/loans/loans-types";
import { Stack } from "@mantine/core";
import { IconAnalyze, IconClockExclamation, IconPlayerRecord, IconStack2 } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { FC } from "react";

export const LoanListTabs: FC = () => {
  const router = useRouter();
  const searchs = useSearchParams();

  const tabs = [
    {
      value: "active",
      icon: IconPlayerRecord,
      label: t("active"),
      isShowCount: true,
      components: renderLoanList({
        strictStatus: [LoanStatus.FULFILLED],
        count: (reports) => reports.realtimeReport.data?.data.loans.contracts.activated || 0,
      }),
    },
    {
      value: "processing",
      icon: IconAnalyze,
      label: t("processing"),
      isShowCount: true,
      components: renderLoanList({
        strictStatus: [LoanStatus.PENDING_SIGN, LoanStatus.PENDING, LoanStatus.APPROVED],
        counterColor: "orange",
        count: (reports) => reports.realtimeReport.data?.data.loans.contracts.pending || 0,
      }),
    },
    {
      value: "overdue",
      label: t("overdue"),
      isShowCount: true,
      icon: IconClockExclamation,
      components: renderLoanList({
        strictStatus: [LoanStatus.OVERDUE],
        counterColor: "red",
        count: (reports) => reports.realtimeReport.data?.data.loans.contracts.overdue || 0,
      }),
    },
    {
      value: "all",
      label: t("all"),
      icon: IconStack2,
      components: renderLoanList(),
    },
  ];

  const activeTabId = searchs.get("ltab") || "active";
  const activeTab = tabs.find((t) => t.value === activeTabId);

  return (
    <Stack>
      <NavigationTabs
        activeTab={activeTabId}
        onChange={(e) => {
          if (!e || e === tabs[0].value) router.removeQuery("ltab");
          else router.setQuery("ltab", e);
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
