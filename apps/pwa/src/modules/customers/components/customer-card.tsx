"use client";

import { DateFormat } from "@/components/format/date-format";
import { useRouter } from "@/hooks/use-router";
import { useTags } from "@/modules/tags/tags-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans, useLingui } from "@lingui/react/macro";
import { Anchor, Badge, Card, CardProps, Group, Stack, Text, ThemeIcon, em } from "@mantine/core";
import { IconClock, IconPhone, IconTags } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";
import { Avatar } from "../../../components/avatar";
import { customerGenders } from "../customer-constants";
import { CustomerDataFragment } from "../graphql/fragmentCustomer.graphql";

interface CustomerCardProps extends CardProps {
  customer: Pick<
    CustomerDataFragment,
    | "_id"
    | "code"
    | "plainCode"
    | "name"
    | "phone"
    | "gender"
    | "avatar"
    | "tagIds"
    | "updatedAt"
    | "lastCheckin"
  >;
  disableClick?: boolean;
  onClick?: () => void;
  showLastCheckin?: boolean;
}

export const CustomerCard: FC<CustomerCardProps> = (props) => {
  const { t } = useLingui();
  const { customer, disableClick, onClick: onClickProps, showLastCheckin, ...rest } = props;

  const router = useRouter();
  const workspace = useWorkspace();
  const IconGender = customer.gender ? customerGenders[customer.gender] : null;
  const tags = useTags();
  const routePath = `/customers/${customer.code}`;

  const onClick = () => {
    if (disableClick) return;
    if (onClickProps) return onClickProps();
    router.push(routePath);
  };

  let pressTimer: NodeJS.Timeout;

  return (
    <Card
      p={10}
      shadow="xs"
      style={!props.disableClick ? { cursor: "pointer" } : {}}
      onClick={onClick}
      {...rest}
    >
      <Group gap={12} align="start">
        <Anchor component={Link} href={`/customers/${customer.code}`} td="none">
          <Avatar customer={customer} radius={5} size={60} />
        </Anchor>

        <Stack mt={-3} gap={5} flex={1}>
          <Group justify="space-between" align="start">
            <Stack flex={1} gap={3}>
              <Anchor>
                <Text
                  fw={700}
                  fz={em(13)}
                  onMouseUp={() => {
                    if (pressTimer) clearTimeout(pressTimer);
                  }}
                  onMouseDown={(e) => {
                    pressTimer = setTimeout(() => {
                      e.preventDefault();
                      e.stopPropagation();

                      // TODO: Add modal to update plain code
                      // if (workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO)) {
                      //   OnModalCustomerPlainCodeForm({
                      //     customer,
                      //     onDone: () => {},
                      //   });
                      // }
                    }, 500);
                  }}
                >
                  {renderEntityCode(customer.code, customer?.plainCode)}
                </Text>
              </Anchor>

              <Text fw={500}>{customer.name}</Text>
            </Stack>
          </Group>

          {(!!customer.phone || !!customer.gender) && (
            <Group gap={16}>
              {!!customer.phone &&
                workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT) && (
                  <Anchor
                    href={`tel:${customer.phone}`}
                    c="var(--mantine-color-text)"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Group gap={1}>
                      <ThemeIcon color="var(--mantine-color-text)" variant="transparent">
                        <IconPhone strokeWidth={1.2} size={18} />
                      </ThemeIcon>
                      <Text fz={16}>{customer.phone}</Text>
                    </Group>
                  </Anchor>
                )}

              {!!customer.gender && IconGender?.icon && (
                <Group gap={1}>
                  <ThemeIcon color="dark" variant="transparent">
                    <IconGender.icon strokeWidth={1.2} size={18} />
                  </ThemeIcon>
                  <Text fz={16}>{t(customerGenders[customer.gender].label)}</Text>
                </Group>
              )}
            </Group>
          )}

          {customer.tagIds && customer.tagIds.length > 0 && (
            <Group gap={1}>
              <ThemeIcon color="dark" variant="transparent">
                <IconTags strokeWidth={1.2} size={18} />
              </ThemeIcon>

              <Group gap={5}>
                {tags.list
                  .filter((v) => v._id && customer.tagIds!.includes(v._id) === true)
                  .map((tag) => (
                    <Badge key={tag._id} color={tag.color || ""} size="sm" tt="none">
                      {tag.name}
                    </Badge>
                  ))}
              </Group>
            </Group>
          )}

          {!!customer.lastCheckin && props.showLastCheckin && (
            <Group gap={1}>
              <ThemeIcon color="dark" variant="transparent">
                <IconClock strokeWidth={1.2} size={18} />
              </ThemeIcon>
              <Text fz={em(15)}>
                <Trans>Last check-in</Trans>
                {": "}
                <DateFormat value={customer.lastCheckin} type="date-time" />
              </Text>
            </Group>
          )}
        </Stack>
      </Group>
    </Card>
  );
};
