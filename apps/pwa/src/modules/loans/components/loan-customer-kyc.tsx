"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { EventType } from "@/graphql/enums.graphql";
import { getCustomerContacts } from "@/modules/customer-contacts/customer-contacts.service";
import { CustomerKycEntity, CustomerKycStatus } from "@/modules/customer-kycs/customer-kycs-types";
import { CustomerKycCard } from "@/modules/customers/customer-detail/customer-kyc-card";
import { CustomerDataFragment } from "@/modules/customers/graphql/fragmentCustomer.graphql";
import { OnModalCustomerContacts } from "@/modules/customers/modals/modal-customer-contacts";
import { useLocations } from "@/modules/locations/locations-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { formatPhoneNumber } from "@/utils/phone.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { Trans } from "@lingui/react/macro";
import {
  Anchor,
  Card,
  Divider,
  em,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { IconAddressBook, IconShieldCheck } from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { LoanRowInfo } from "./loan-row-info";

interface LoanCustomerKycProps {
  customer: CustomerDataFragment;
  kyc: CustomerKycEntity;
}

export const LoanCustomerKyc: FC<LoanCustomerKycProps> = (props) => {
  const { customer } = props;
  const workspace = useWorkspace();
  const { getGoogleMapLink } = useLocations();

  const contacts = useFetch({
    id: `customer-contacts-${customer._id}`,
    skip: !workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT),
    fetch: () => getCustomerContacts(customer._id),
    refetchEvents: [EventType.CustomerContactsUpdated],
  });

  const kyc = props.kyc?.versions[props.kyc?.versions.length - 1];

  return (
    <Stack>
      <Card shadow="xs">
        <Stack>
          {props.kyc && kyc && (
            <Fragment>
              <Divider label={<Trans>CID Infos</Trans>} labelPosition="left" />

              <LoanRowInfo
                label={<Trans>CID number</Trans>}
                value={kyc.cidNumber}
                renderValue={() => (
                  <Group gap={10}>
                    <Text>{kyc?.cidNumber || "--"}</Text>
                    {props.kyc.status === CustomerKycStatus.APPROVED && (
                      <ThemeIcon color="green" size="xs" variant="transparent">
                        <IconShieldCheck strokeWidth={3} />
                      </ThemeIcon>
                    )}
                  </Group>
                )}
              />
              {kyc?.cidCreatedAt && (
                <LoanRowInfo
                  label={<Trans>CID created at</Trans>}
                  value={kyc?.cidCreatedAt}
                  renderValue={(value) => <DateFormat value={value} type="date" />}
                />
              )}
            </Fragment>
          )}

          <Divider label={<Trans>Personal informations</Trans>} labelPosition="left" />

          <LoanRowInfo
            label={<Trans>Current address</Trans>}
            value={customer.vnLocationFullAddress || ""}
            renderValue={() => (
              <Tooltip
                label={
                  <Fragment>
                    <Trans>Previous address</Trans>: {customer.vnPrevLocationFullAddress}
                  </Fragment>
                }
                disabled={!customer.vnPrevLocationFullAddress}
              >
                <Anchor
                  href={
                    !!customer.vnLocationFullAddress
                      ? getGoogleMapLink(customer.vnLocationFullAddress)
                      : ""
                  }
                  target="_blank"
                >
                  {customer.vnLocationFullAddress || "--"}
                </Anchor>
              </Tooltip>
            )}
          />

          <LoanRowInfo
            label={<Trans>Secondary address (Hometown)</Trans>}
            value={customer.vnSecondaryLocationFullAddress || ""}
            renderValue={(value) => (
              <Tooltip
                label={
                  <Fragment>
                    <Trans>Previous address</Trans>: {customer.vnPrevSecondaryLocationFullAddress}
                  </Fragment>
                }
                disabled={!customer.vnPrevSecondaryLocationFullAddress}
              >
                <Anchor href={value && getGoogleMapLink(value)} target="_blank">
                  {customer.vnSecondaryLocationFullAddress || "--"}
                </Anchor>
              </Tooltip>
            )}
          />

          <LoanRowInfo
            label={<Trans>Salary amount</Trans>}
            value={customer.salaryAmount ?? 0}
            renderValue={(value) => (value ? <CurrencyFormat value={value} /> : "--")}
          />

          {workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT) && (
            <Fragment>
              <Divider label={<Trans>Contacts</Trans>} labelPosition="left" />

              <LoanRowInfo
                label={<Trans>Phone</Trans>}
                value={customer.phone as any}
                renderValue={(value) => (
                  <Anchor href={`tel:${value}`}>{formatPhoneNumber(value)}</Anchor>
                )}
              />

              <LoanRowInfo
                label={<Trans>Relative contacts</Trans>}
                value={customer.relationshipContacts ?? []}
                renderValue={(value) =>
                  value && value.length > 0 ? (
                    <Stack>
                      {value.map((contact, index) => (
                        <Card withBorder shadow="none" p={10} key={index}>
                          <Group key={index} justify="space-between">
                            <Stack gap={0}>
                              <Text fw={500}>{contact.name}</Text>
                              <Text fz={em(12)}>{contact.type}</Text>
                            </Stack>
                            <Anchor href={`tel:${contact.phone}`}>
                              {formatPhoneNumber(contact.phone)}
                            </Anchor>
                          </Group>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    "--"
                  )
                }
              />

              <LoanRowInfo
                label={<Trans>Contacts</Trans>}
                value={contacts.data?.contacts.length}
                renderValue={() =>
                  contacts.isFetching ? (
                    <Loader size="xs" />
                  ) : contacts.data ? (
                    <Anchor
                      c="dark"
                      onClick={(e) => {
                        e.stopPropagation();
                        OnModalCustomerContacts({ contacts: contacts.data! });
                      }}
                    >
                      <Group gap={1} wrap="nowrap">
                        <ThemeIcon color="dark" variant="transparent" ml={-5}>
                          <IconAddressBook strokeWidth={1.5} size={18} />
                        </ThemeIcon>
                        <Text fz={em(15)}>
                          <NumberFormat value={contacts.data.contacts.length} />
                        </Text>
                      </Group>
                    </Anchor>
                  ) : (
                    "--"
                  )
                }
              />
            </Fragment>
          )}
        </Stack>
      </Card>

      <CustomerKycCard kyc={props.kyc} hideCustomer />
    </Stack>
  );
};
