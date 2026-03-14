"use client";

import { Avatar } from "@/components/avatar";
import { SpeedIllustration } from "@/components/illustrations/speed";
import { Renderer } from "@/components/renderer";
import { appEntities } from "@/constant";
import { useRouter } from "@/hooks/use-router";
import { searchArray } from "@/modules/search/search-service";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useLazyQuery } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Badge, Card, Center, Loader, rem, Stack, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { Spotlight, SpotlightActionData, SpotlightActionGroupData } from "@mantine/spotlight";
import {
  Icon,
  IconCashRegister,
  IconCreditCardPay,
  IconSearch,
  IconStack2,
  IconTopologyStar3,
} from "@tabler/icons-react";
import { type FC, ReactNode, useMemo, useState } from "react";
import { loanStatuses } from "../loans/loans-constants";
import { productTypes } from "../products/products-constants";
import { updateTaskPath } from "../tasks/tasks-route-helpers";
import { useWorkspaceSetting } from "../workspace-settings/hooks/use-workspace-setting";
import {
  useAvailableWorkspaceModules,
  useWorkspaceModules,
  WorkspaceModule,
} from "../workspaces/workspace-modules";
import QUERY_SEARCH from "./graphql/querySearch.graphql";

export const SearchEngine: FC = () => {
  const { i18n, t } = useLingui();
  const workspace = useWorkspace();
  const { workspaceSetting } = useWorkspaceSetting();
  const { getModule } = useWorkspaceModules();
  const { isModuleAvailable, availableModules } = useAvailableWorkspaceModules();
  const router = useRouter();

  const [query, setQuery] = useState("");

  const [searchQuery, { data: searchResult, loading: isSearchLoading }] = useLazyQuery(
    QUERY_SEARCH,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    }
  );

  const isHasSearchResult =
    !!query && query.length > 0 && !!searchResult && Object.keys(searchResult).length > 0;

  const isMessageBoxesEnabled = isModuleAvailable("messageBoxes");

  const searchModules = availableModules.filter((workspaceModule) => {
    return (
      workspaceModule &&
      (!workspaceModule.restrictDisplay || workspaceModule.restrictDisplay.includes("spotlight"))
    );
  });

  const matchedModules: WorkspaceModule[] =
    query && query.length > 0
      ? searchArray(searchModules, [], query, (mod) => mod.name + (mod.description || ""))
      : [];

  const strictSearchEntity = (entity: string) => {
    if ((workspaceSetting?.searchSettings?.hideEntities || []).includes(entity)) return false;
    return true;
  };

  const actions: (SpotlightActionGroupData | SpotlightActionData)[] = useMemo(() => {
    const actionGroups: SpotlightActionGroupData[] = [];
    if (!workspace.isAvailable) return actionGroups;

    if (isHasSearchResult) {
      let groups: Record<string, SpotlightActionData[]> = {};

      searchResult.search.forEach((result) => {
        if (!strictSearchEntity(result.entity)) return;

        if (!groups[result.entity]) {
          groups[result.entity] = [];
        }

        if (result.__typename === "SearchResultCustomer") {
          groups[result.entity].push({
            id: result.id,
            label: result.name,
            description: [result.phone].filter((v) => !!v).join(" - "),
            leftSection: <Avatar customer={result} radius={8} />,
            onClick: async () => {
              return router.push(`/customers/${result.code}`);
            },
          });
        }

        if (result.__typename === "SearchResultWorkspaceMember") {
          groups[result.entity].push({
            id: result.id,
            label: result.name,
            description: [result.phone].filter((v) => !!v).join(" - "),
            leftSection: <Avatar user={result} size={30} />,
          });
        }

        if (result.__typename === "SearchResultProduct") {
          const productType = productTypes[result.type as keyof typeof productTypes];
          if (!productType) return;
          groups[result.entity].push({
            id: result.id,
            label: result.name,
            leftSection: <ActionIcon icon={productType.icon} />,
            onClick: async () => {
              return router.push(`/products/${result.id}`);
            },
          });
        }

        if (result.__typename === "SearchResultReceipt") {
          groups[result.entity].push({
            id: result.id,
            label: renderEntityCode(result.code),
            description: [t`Receipt`, result.note].filter((v) => !!v).join(" - "),
            leftSection: <ActionIcon icon={IconCashRegister} />,
            onClick: async () => {
              return router.push(`/receipts/${result.id}`);
            },
          });
        }

        if (result.__typename === "SearchResultTask") {
          groups[result.entity].push({
            id: result.id,
            label: result.name,
            description: [renderEntityCode(result.code)].filter((v) => !!v).join(" - "),
            leftSection: <ActionIcon icon={IconStack2} />,
            onClick: async () => {
              return router.push(updateTaskPath({ code: result.code }));
            },
          });
        }

        if (result.__typename === "SearchResultLoan") {
          const loanStatus = loanStatuses[result.status as keyof typeof loanStatuses];
          if (!loanStatus) return;

          groups[result.entity].push({
            id: result.id,
            label: renderEntityCode(result.code),
            description: [result.customerName, result.customerPhone].filter((v) => !!v).join(" - "),
            leftSection: <ActionIcon icon={IconCreditCardPay} />,
            onClick: async () => {
              return router.push(`/loans/${result.code}`);
            },
            rightSection: (
              <Badge size="xs" color={loanStatus.color}>
                {t(loanStatus.label)}
              </Badge>
            ),
          });
        }

        if (result.__typename === "SearchResultPartner") {
          groups[result.entity].push({
            id: result.id,
            label: result.name,
            description: [result.phone].filter((v) => !!v).join(" - "),
            leftSection: <ActionIcon icon={IconTopologyStar3} />,
            onClick: async () => {
              return router.push(`/partners`);
            },
          });
        }

        if (result.__typename === "SearchResultWorkspaceMember") {
          groups[result.entity].push({
            id: result.id,
            label: result.name,
            description: [result.phone, result.email].filter((v) => !!v).join(" - "),
            leftSection: <Avatar user={result} size={30} />,
            onClick: async () => {
              return router.push(`/members/${result.userId}`);
            },
          });
        }
      });

      Object.keys(groups).forEach((entity) => {
        actionGroups.push({
          group: t(appEntities[entity as AppEntity].name),
          actions: groups[entity].map((group) => ({
            ...group,
            datatype: entity,
          })),
        });
      });
    }

    if (matchedModules.length > 0) {
      actionGroups.push({
        group: t`Modules`,
        actions: matchedModules.map((matchedModule) => {
          const parentId = availableModules.find((v) => {
            return v.href === `/${matchedModule.href.split("/")[1]}` && v.id !== matchedModule.id;
          });

          const parent = parentId ? getModule(parentId.id) : undefined;
          const label = parent ? `${parent.name} > ${matchedModule.name}` : matchedModule.name;

          return {
            id: matchedModule.id,
            label,
            description: matchedModule.description,
            leftSection: <ActionIcon icon={matchedModule.icon} />,
            onClick: async () => {
              return router.push(matchedModule.href);
            },
          };
        }),
      });
    }

    return actionGroups;
  }, [workspace, searchResult, isMessageBoxesEnabled, matchedModules, i18n, t]);

  const handleSearch = useDebouncedCallback(async (q: string) => {
    try {
      await searchQuery({
        variables: { query: q },
      });
    } catch (error) {
      onError(error);
    }
  }, 300);

  return (
    <Spotlight
      autoFocus
      scrollable
      actions={actions}
      onQueryChange={(q) => {
        setQuery(q);

        if (q.length > 0) {
          handleSearch(q);
        }
      }}
      searchProps={{
        leftSection: <IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />,
        placeholder: `${t`Search`}...`,
        rightSection: (
          <Renderer visible={isSearchLoading}>
            <Loader size={18} type="dots" color="gray" />
          </Renderer>
        ),
      }}
      query={query}
      highlightQuery
      filter={(_, actions) => actions}
      nothingFound={
        query.length > 0 && !isSearchLoading ? (
          <EmptySearch message={<Trans>No search results</Trans>} />
        ) : (
          <EmptySearch message={<Trans>Type something to search</Trans>} />
        )
      }
      styles={{
        content: !isHasSearchResult
          ? {
              height: "auto",
            }
          : undefined,
      }}
    />
  );
};

const EmptySearch: FC<{ message: ReactNode }> = (props) => {
  return (
    <Stack align="center" justify="center" p={32}>
      <SpeedIllustration width={140} />
      <Text fz={12} c="gray.5" fw={300}>
        {props.message}
      </Text>
    </Stack>
  );
};

export const ActionIcon: FC<{ icon: Icon }> = (props) => {
  return (
    <Card w={38} h={38} p={0} bg="var(--mantine-color-default-hover)">
      <Center h={38}>
        <props.icon strokeWidth={1.5} size={18} />
      </Center>
    </Card>
  );
};
