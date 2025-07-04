import { OnModalCustomerPlainCodeForm } from "@/modules/customers/modals/modal-customer-plain-code-form";
import { useRouter } from "@/hooks/use-router";
import { renderGener, renderGenerIcon } from "../customer-service";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { renderDateTime } from "@/modules/lang/lang-service";
import { useTags } from "@/modules/tags/tags-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { Anchor, Badge, Card, CardProps, Group, Stack, Text, ThemeIcon, em } from "@mantine/core";
import { IconClock, IconPhone, IconTags } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";
import { Avatar } from "../../../components/avatar";

interface CustomerCardProps extends CardProps {
  customer: CustomerShortInfo;
  disableClick?: boolean;
  onClick?: () => void;
  showLastCheckin?: boolean;
}

export const CustomerCard: FC<CustomerCardProps> = (props) => {
  const { customer, disableClick, onClick: onClickProps, showLastCheckin, ...rest } = props;

  const router = useRouter();
  const workspace = useWorkspace();
  const IconGender = renderGenerIcon(customer.gender);
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

                      if (workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO)) {
                        OnModalCustomerPlainCodeForm({
                          customer: customer,
                          onDone: () => {},
                        });
                      }
                    }, 500);
                  }}
                >
                  {renderEntityCode(customer.code, customer.plainCode)}
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

              {!!customer.gender && (
                <Group gap={1}>
                  <ThemeIcon color="dark" variant="transparent">
                    <IconGender strokeWidth={1.2} size={18} />
                  </ThemeIcon>
                  <Text fz={16}>{renderGener(customer.gender)}</Text>
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
              <Text fz={em(15)}>Lần check-in gần nhất: {renderDateTime(customer.lastCheckin)}</Text>
            </Group>
          )}
        </Stack>
      </Group>
    </Card>
  );
};
