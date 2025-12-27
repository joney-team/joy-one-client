"use client";

import { Avatar } from "@/components/avatar";
import { SpeedIllustration } from "@/components/illustrations/speed";
import { Renderer } from "@/components/renderer";
import { useRouter } from "@/hooks/use-router";
import { loanStatusColors } from "@/modules/loans/loans-service";
import { OrderEntity } from "@/modules/orders/order-entity";
import { PartnerEntity } from "@/modules/partners/partners-types";
import { OnModalPrescriptionForm } from "@/modules/prescriptions/modals/modal-prescription-form";
import { PrescriptionEntity } from "@/modules/prescriptions/prescriptions-types";
import { getProductIcon } from "@/modules/products/products-service";
import { ProductEntity } from "@/modules/products/products-types";
import { ReceiptEntity } from "@/modules/receipts/receipts-types";
import { search, searchArray } from "@/modules/search/search-service";
import {
  SearchCustomer,
  SearchEntityResult,
  SearchLoan,
  SearchResult,
} from "@/modules/search/search-types";
import { TaskEntity } from "@/modules/tasks/tasks-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useLingui } from "@lingui/react/macro";
import { Badge, Card, Center, Loader, rem, Stack, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { Spotlight, SpotlightActionData, SpotlightActionGroupData } from "@mantine/spotlight";
import {
  Icon,
  IconCashRegister,
  IconClipboardText,
  IconCreditCardPay,
  IconMessageCircle,
  IconNews,
  IconPill,
  IconSearch,
  IconStack2,
  IconTopologyStar3,
} from "@tabler/icons-react";
import { type FC, useMemo, useState } from "react";
import { loanStatuses } from "../loans/loans-constants";
import { productTypes } from "../products/products-constants";
import { useTaskRouter } from "../tasks/hooks/use-task-router";
import { updateTaskPath } from "../tasks/tasks-route-helpers";
import {
  useAvailableWorkspaceModules,
  useWorkspaceModules,
  WorkspaceModule,
} from "../workspaces/workspace-modules";

export const SearchEngine: FC = () => {
  const workspace = useWorkspace();
  const { getModule } = useWorkspaceModules();
  const { isModuleAvailable, availableModules } = useAvailableWorkspaceModules();
  const router = useRouter();
  const taskRouter = useTaskRouter();
  const { i18n, t } = useLingui();

  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);

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

  const strictSearchEntity = (entity: AppEntity) => {
    if ((workspace.settings.searchSettings?.hideEntities || []).includes(entity)) return false;
    return true;
  };

  const actions: (SpotlightActionGroupData | SpotlightActionData)[] = useMemo(() => {
    const actionGroups: SpotlightActionGroupData[] = [];
    if (!workspace.isAvailable) return actionGroups;

    if (isHasSearchResult) {
      Object.keys(searchResult).forEach((entity) => {
        const data = (searchResult as any)[entity] as SearchEntityResult[];
        if (!data || !strictSearchEntity(entity as AppEntity)) return;

        if (isMessageBoxesEnabled && entity === AppEntity.MESSAGE_BOXES) {
          actionGroups.push({
            group: t`Message boxes`,
            actions: data.map((box) => {
              return {
                id: box._id,
                label: box.name || box.senderName,
                description: box.description,
                leftSection: <ActionIcon icon={IconMessageCircle} />,
                onClick: async () => {
                  return router.push(`/message-boxes/${box._id}`);
                },
              };
            }),
          });
        }

        if (entity === AppEntity.POSTS) {
          actionGroups.push({
            group: t`Posts`,
            actions: data.map((post) => {
              return {
                id: post._id,
                label: post.title,
                description: post.excerpt,
                leftSection: <ActionIcon icon={IconNews} />,
                onClick: async () => {
                  return router.push(`/posts/${post._id}`);
                },
                datatype: entity,
              };
            }),
          });
        }

        if (entity === AppEntity.CUSTOMERS) {
          const customers = data as SearchCustomer[];

          actionGroups.push({
            group: t`Customers`,
            actions: customers.map((customer) => {
              return {
                id: customer._id,
                label: `${customer.name}`,
                description: [
                  customer.phone,
                  customer.email,
                  renderEntityCode(customer.code, customer.plainCode),
                ]
                  .filter((v) => !!v)
                  .filter((v) => !!v)
                  .join(" - "),
                leftSection: <Avatar customer={customer as any} radius={8} />,
                onClick: async () => {
                  return router.push(`/customers/${customer.code}`);
                },
                datatype: entity,
              };
            }),
          });
        }

        if (entity === AppEntity.PRODUCTS) {
          const products = data as ProductEntity[];

          products.forEach((product) => {
            const ProductIcon = getProductIcon(product.type);
            const action: SpotlightActionData = {
              id: product._id,
              label: `${product.name}`,
              description: product.tags?.join(", "),
              leftSection: <ActionIcon icon={ProductIcon} />,
              onClick: async () => {
                return router.push(`/products/${product._id}`);
              },
              datatype: entity,
            };

            const existed = actionGroups.findIndex(
              (v) => v.group === productTypes[product.type].label()
            );
            if (existed >= 0) {
              actionGroups[existed].actions.push(action);
            } else {
              actionGroups.push({
                group: productTypes[product.type].label(),
                actions: [action],
              });
            }
          });
        }

        if (entity === AppEntity.RECEIPTS) {
          const receipts = data as ReceiptEntity[];

          actionGroups.push({
            group: t`Receipts`,
            actions: receipts.map((receipt) => {
              return {
                id: receipt.id,
                label: `${renderEntityCode(receipt.code)}`,
                description: [t`Receipt`, receipt.note].filter((v) => !!v).join(" - "),
                leftSection: <ActionIcon icon={IconCashRegister} />,
                onClick: async () => {
                  return router.push(`/receipts/${receipt.id}`);
                },
              };
            }),
          });
        }

        if (entity === AppEntity.TASKS) {
          const tasks = data as TaskEntity[];

          actionGroups.push({
            group: t`Tasks`,
            actions: tasks.map((task) => {
              return {
                id: task._id,
                label: `${task.name}`,
                description: [renderEntityCode(task.code)].filter((v) => !!v).join(" - "),
                leftSection: <ActionIcon icon={IconStack2} />,
                onClick: async () => router.push(updateTaskPath({ code: task.code })),
              };
            }),
          });
        }

        if (entity === AppEntity.LOANS) {
          const loans = data as SearchLoan[];

          actionGroups.push({
            group: t`Loans`,
            actions: loans.map((loan) => {
              return {
                id: loan.id!,
                label: renderEntityCode(loan.code),
                description: [
                  loan.customerName,
                  loan.customerPhone,
                  loan.imeil ? `IMEIL: ${loan.imeil}` : "",
                ]
                  .filter((v) => !!v)
                  .join(" - "),
                leftSection: <ActionIcon icon={IconCreditCardPay} />,
                onClick: async () => {
                  return router.push(`/loans/${loan.code}`);
                },
                rightSection: (
                  <Badge size="xs" color={loanStatusColors[loan.status]}>
                    {t(loanStatuses[loan.status].label)}
                  </Badge>
                ),
              };
            }),
          });
        }

        if (entity === AppEntity.PARTNERS) {
          const partners = data as PartnerEntity[];

          actionGroups.push({
            group: t`Partners`,
            actions: partners.map((partner) => {
              return {
                id: partner._id,
                label: `${partner.name}`,
                description: [partner.phone, partner.email].filter((v) => !!v).join(" - "),
                leftSection: <ActionIcon icon={IconTopologyStar3} />,
                onClick: async () => {
                  return router.push(`/partners`);
                },
              };
            }),
          });
        }

        if (entity === AppEntity.WORKSPACE_MEMBERS) {
          actionGroups.push({
            group: t`Members`,
            actions: data.map((doc) => {
              return {
                id: doc.id,
                label: `${doc.name}`,
                description: [doc.phone, doc.email].filter((v) => !!v).join(" - "),
                leftSection: <Avatar user={doc} size={30} />,
                onClick: async () => {
                  // TODO: Implement page member information
                  return router.push(`/members/${doc.userId}`);
                },
              };
            }),
          });
        }

        if (entity === AppEntity.ORDERS) {
          const orders = data as OrderEntity[];

          actionGroups.push({
            group: t`Orders`,
            actions: orders.map((order) => {
              return {
                id: order.id,
                label: `${renderEntityCode(order.code)}`,
                description: t`Orders`,
                leftSection: <ActionIcon icon={IconClipboardText} />,
                onClick: async () => {
                  return router.push(`/orders/${order.code}`);
                },
              };
            }),
          });
        }

        if (entity === AppEntity.PRESCRIPTIONS) {
          const prescriptions = data as PrescriptionEntity[];

          actionGroups.push({
            group: t`Prescriptions`,
            actions: prescriptions.map((prescription) => {
              return {
                id: prescription._id,
                label: `${prescription.name}`,
                leftSection: <ActionIcon icon={IconPill} />,
                onClick: async () => {
                  return OnModalPrescriptionForm({ prescription });
                },
              };
            }),
          });
        }
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
      const result = await search(q);
      setSearchResult(result);
    } catch (error) {
      onError(error);
    } finally {
      setIsSearching(false);
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
          setIsSearching(true);
          handleSearch(q);
        }
      }}
      searchProps={{
        leftSection: <IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />,
        placeholder: `${t`Search`}...`,
        rightSection: (
          <Renderer visible={isSearching}>
            <Loader size={18} type="dots" color="gray" />
          </Renderer>
        ),
      }}
      query={query}
      highlightQuery
      filter={(_, actions) => actions}
      nothingFound={
        query.length > 0 && !isSearching ? (
          <EmptySearch message={t`No search results`} />
        ) : (
          <EmptySearch message={t`Type something to search`} />
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

const EmptySearch: FC<{ message: string }> = (props) => {
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
