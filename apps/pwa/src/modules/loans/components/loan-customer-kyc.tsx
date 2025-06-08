"use client";

import { CustomerKycCard } from "@/modules/customers/customer-kyc-card";
import { OnModalCustomerContacts } from "@/modules/customers/modals/modal-customer-contacts";
import { getCustomerContacts } from "@/modules/customer-contacts/customer-contacts.service";
import { CustomerKycEntity, CustomerKycStatus } from "@/modules/customer-kycs/customer-kycs-types";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { EventType } from "@/modules/events/event-types";
import { num, renderDate } from "@/modules/lang/lang-service";
import { getGoogleMapLink, renderLocation } from "@/modules/locations/locations-service";
import { formatPhoneNumber } from "@/utils/phone.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { Anchor, Card, Divider, em, Grid, Group, Loader, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAddressBook, IconShieldCheck } from "@tabler/icons-react";
import { FC } from "react";
import { LoanRowInfo } from "./loang-row-info";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";

interface LoanCustomerKycProps {
  customer: CustomerEntity;
  kyc: CustomerKycEntity;
}

export const LoanCustomerKyc: FC<LoanCustomerKycProps> = (props) => {
  const { customer } = props;
  const workspace = useWorkspace();

  const contacts = useFetch({
    id: `customer-contacts-${customer._id}`,
    skip: !workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT),
    fetch: () => getCustomerContacts(customer._id),
    events: [EventType.CUSTOMER_CONTACTS_UPDATED],
  });

  const kyc = props.kyc?.versions[props.kyc?.versions.length - 1];

  return (
    <Grid>
      <Grid.Col span={{ md: 5 }}>
        <Card shadow="xs">
          <Stack>
            {props.kyc && kyc && (
              <>
                <Divider label="Căn Cước Công Dân" labelPosition="left" />

                <LoanRowInfo
                  label="Số CCCD"
                  value={
                    <Group gap={10}>
                      <Text>{kyc?.cidNumber || "--"}</Text>
                      {props.kyc.status === CustomerKycStatus.APPROVED && (
                        <ThemeIcon color="green" size="xs" variant="transparent">
                          <IconShieldCheck strokeWidth={3} />
                        </ThemeIcon>
                      )}
                    </Group>
                  }
                />
                <LoanRowInfo
                  label="Ngày cấp"
                  value={
                    <Group>
                      <Text>{renderDate(kyc?.cidCreatedAt)}</Text>
                    </Group>
                  }
                />
              </>
            )}

            <Divider label="Thông tin cá nhân" labelPosition="left" />

            <LoanRowInfo
              label="Địa chỉ hiện tại"
              value={
                <Anchor href={customer.location && getGoogleMapLink(customer.location)} target="_blank">
                  {renderLocation(customer.location) || "--"}
                </Anchor>
              }
            />

            <LoanRowInfo
              label="Địa chỉ thứ 2 (Quê quán)"
              value={
                <Anchor
                  href={customer.secondaryLocation && getGoogleMapLink(customer.secondaryLocation)}
                  target="_blank"
                >
                  {renderLocation(customer.secondaryLocation)}
                </Anchor>
              }
            />

            <LoanRowInfo label="Mức lương hiện tại" value={num(customer.salaryAmount, { type: "money" })} />

            {workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT) && (
              <>
                <Divider label="Liên hệ" labelPosition="left" />

                <LoanRowInfo
                  label="Số điện thoại"
                  value={<Anchor href={`tel:${customer.phone}`}>{formatPhoneNumber(customer.phone)}</Anchor>}
                />

                <LoanRowInfo
                  label="SĐT Người thân"
                  value={
                    customer.relationshipContacts && customer.relationshipContacts.length > 0 ? (
                      <>
                        <Stack>
                          {customer.relationshipContacts.map((contact, index) => (
                            <Card withBorder shadow="none" p={10} key={index}>
                              <Group key={index} justify="space-between">
                                <Stack gap={0}>
                                  <Text fw={500}>{contact.name}</Text>
                                  <Text fz={em(12)}>{contact.type}</Text>
                                </Stack>
                                <Anchor href={`tel:${contact.phone}`}>{formatPhoneNumber(contact.phone)}</Anchor>
                              </Group>
                            </Card>
                          ))}
                        </Stack>
                      </>
                    ) : (
                      "--"
                    )
                  }
                />

                <LoanRowInfo
                  label="Danh bạ"
                  value={
                    contacts.isFetching ? (
                      <Loader size="xs" />
                    ) : contacts.data ? (
                      <>
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
                            <Text fz={em(15)}>{num(contacts.data.contacts.length)}</Text>
                          </Group>
                        </Anchor>
                      </>
                    ) : (
                      "--"
                    )
                  }
                />
              </>
            )}
          </Stack>
        </Card>
      </Grid.Col>

      <Grid.Col span="auto">
        <CustomerKycCard kyc={props.kyc} hideCustomer />
      </Grid.Col>
    </Grid>
  );
};
