"use client";

import { DateFormat } from "@/components/format/date-format";
import { NumberFormat } from "@/components/format/number-format";
import { TagType, WorkspaceType } from "@/graphql/enums.graphql";
import { OnModalCustomerContacts } from "@/modules/customers/modals/modal-customer-contacts";
import { OnModalCustomerPlainCodeForm } from "@/modules/customers/modals/modal-customer-plain-code-form";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { ModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { WorkspaceMembersInput } from "@/modules/workspace-members/components/workspace-members-input";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { useMutation, useQuery } from "@apollo/client/react";
import config from "@joy-one-client/config";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Card,
  Center,
  CheckIcon,
  ColorSwatch,
  Group,
  Popover,
  Stack,
  Text,
  ThemeIcon,
  em,
  rem,
} from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import {
  IconAddressBook,
  IconCake,
  IconMail,
  IconPencil,
  IconPhone,
  IconPlus,
  IconTags,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import { FC, Fragment, useRef, useState } from "react";
import { EntityImage } from "../../../components/entity-image";
import { Renderer } from "../../../components/renderer";
import { customerGenders, normalizeCustomerInput } from "../customer-constants";
import { CustomerFragment } from "../graphql/fragmentCustomer.graphql";

import { Badge } from "@/components/badge";
import GetCustomerContactsDocument from "@/modules/customer-contacts/graphql/getCustomerContacts.graphql";
import { useTags } from "@/modules/tags/hooks/use-tags";
import type { ModalTagFormRef } from "@/modules/tags/modals/modal-tag-form";
import { nonLoading } from "@/utils/non-loading";
import dynamic from "next/dynamic";
import type { ModalCustomerRef } from "../customer-modal";
import AssignCustomerDocument from "../graphql/assignCustomer.graphql";
import UpdateCustomerDocument from "../graphql/updateCustomer.graphql";
import type { ModalCustomerRelationshipContactsRef } from "../modals/modal-customer-relationship-contacts";

const ModalCustomerRelationshipContacts = dynamic(
  () =>
    import("../modals/modal-customer-relationship-contacts").then(
      (mod) => mod.ModalCustomerRelationshipContacts,
    ),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalCustomer = dynamic(() => import("../customer-modal").then((mod) => mod.ModalCustomer), {
  ssr: false,
  loading: nonLoading,
});

interface CustomerInformationsProps {
  customer: CustomerFragment;
  withBorder?: boolean;
}

export const CustomerInformations: FC<CustomerInformationsProps> = (props) => {
  const { t } = useLingui();
  const workspace = useWorkspace();
  const { tags } = useTags(TagType.Customer);
  const isCanUpdateInfo = workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO);
  const uploadFile = useUploadFile();
  const modalCustomerRef = useRef<ModalCustomerRef>(null);
  const modalCustomerRelationshipContactsRef = useRef<ModalCustomerRelationshipContactsRef>(null);
  const modalTagFormRef = useRef<ModalTagFormRef>(null);

  const { customer } = props;
  const customerGener = customer.gender ? customerGenders[customer.gender] : null;

  const [updateCustomer] = useMutation(UpdateCustomerDocument);
  const [assignCustomer] = useMutation(AssignCustomerDocument);

  const [tagListOpened, setTagListOpened] = useState(false);
  const ref = useClickOutside(() => setTagListOpened(false));

  const { data: customerContacts } = useQuery(GetCustomerContactsDocument, {
    variables: {
      customerId: customer._id,
    },
  });

  const uploadAvatar = async (file: File) => {
    try {
      const avatarFile = await uploadFile(file, {
        refs: [`${AppEntity.CUSTOMERS}:${customer._id}`],
        compressSize: 1,
      });
      await updateCustomer({
        variables: {
          id: customer._id,
          input: normalizeCustomerInput({ ...customer, avatar: avatarFile.path }),
        },
      });
    } catch (error) {
      onError(error);
    }
  };

  const toggleTag = async (tag: any) => {
    if (customer.tagIds?.includes(tag._id)) {
      await updateCustomer({
        variables: {
          id: customer._id,
          input: normalizeCustomerInput({
            ...customer,
            tagIds: (customer.tagIds || []).filter((tagId) => tagId !== tag._id),
          }),
        },
      });
    } else {
      await updateCustomer({
        variables: {
          id: customer._id,
          input: normalizeCustomerInput({
            ...customer,
            tagIds: [...(customer.tagIds || []), tag._id],
          }),
        },
      });
    }
  };

  return (
    <Fragment>
      <Card
        p="sm"
        {...(props.withBorder
          ? {
              shadow: "none",
              withBorder: true,
            }
          : {
              shadow: "xs",
            })}
      >
        <Group align="start" wrap="nowrap" justify="space-between">
          <Stack gap={8}>
            <Group wrap="nowrap" align="start" gap={10}>
              <EntityImage
                src={customer.avatar}
                onChange={(file) => uploadAvatar(file)}
                name={customer.name}
                icon={IconUserSquareRounded}
                readonly={!isCanUpdateInfo}
              />

              <Stack gap={5}>
                <Group>
                  <Anchor
                    onClick={() => {
                      if (!isCanUpdateInfo) return;

                      OnModalCustomerPlainCodeForm({
                        customer,
                        onDone: () => {},
                      });
                    }}
                    mb={-3}
                  >
                    <Text pl={5} fw={700} fz={em(13)}>
                      {renderEntityCode(customer.code, customer.plainCode)}
                    </Text>
                  </Anchor>

                  {config.ENV === "development" && (
                    <Badge color="gray" variant="transparent">
                      #{customer._id}
                    </Badge>
                  )}
                </Group>

                <Text fw={500} fz={em(18)}>
                  {customer.name}
                </Text>

                <Group gap="md">
                  {customer.birthday && (
                    <Group gap={1} wrap="nowrap">
                      <ThemeIcon color="dark" variant="transparent">
                        <IconCake strokeWidth={1.5} size={18} />
                      </ThemeIcon>
                      <Text fz={em(15)}>
                        <DateFormat value={customer.birthday} type="date" />
                      </Text>
                    </Group>
                  )}

                  {customer.gender && customerGener && (
                    <Group gap={1} wrap="nowrap">
                      <ThemeIcon color="dark" variant="transparent">
                        <customerGener.icon strokeWidth={1.5} size={18} />
                      </ThemeIcon>
                      <Text fz={em(15)}>{t(customerGener.label)}</Text>
                    </Group>
                  )}

                  {customer.phone && (
                    <Anchor
                      href={`tel:${customer.phone}`}
                      c="dark"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Group gap={1} wrap="nowrap">
                        <ThemeIcon color="dark" variant="transparent">
                          <IconPhone strokeWidth={1.5} size={18} />
                        </ThemeIcon>
                        <Text fz={em(15)}>{customer.phone}</Text>
                      </Group>
                    </Anchor>
                  )}

                  <Renderer
                    visible={
                      workspace.type === WorkspaceType.Credit &&
                      workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT)
                    }
                  >
                    <Anchor
                      c="dark"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!customerContacts?.customerContact) return;
                        OnModalCustomerContacts({ contacts: customerContacts?.customerContact });
                      }}
                    >
                      <Group gap={1} wrap="nowrap">
                        <ThemeIcon color="dark" variant="transparent">
                          <IconAddressBook strokeWidth={1.5} size={18} />
                        </ThemeIcon>
                        <Text fz={em(15)}>
                          <Trans>Contacts</Trans>
                          {": "}
                          <NumberFormat
                            value={customerContacts?.customerContact.contacts.length ?? 0}
                          />
                        </Text>
                      </Group>
                    </Anchor>

                    <Anchor
                      c="dark"
                      onClick={(e) => {
                        e.stopPropagation();
                        modalCustomerRelationshipContactsRef.current?.open({ customer });
                      }}
                    >
                      <Group gap={1} wrap="nowrap">
                        <ThemeIcon color="dark" variant="transparent">
                          <IconAddressBook strokeWidth={1.5} size={18} />
                        </ThemeIcon>
                        <Text fz={em(15)}>
                          <Trans>Contact relatives</Trans>
                          {": "}
                          <NumberFormat value={customer.relationshipContacts?.length ?? 0} />
                        </Text>
                      </Group>
                    </Anchor>
                  </Renderer>

                  {customer.email && (
                    <Anchor
                      href={`mailto:${customer.email}`}
                      c="dark"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Group gap={1} wrap="nowrap">
                        <ThemeIcon color="dark" variant="transparent">
                          <IconMail strokeWidth={1.5} size={18} />
                        </ThemeIcon>
                        <Text fz={em(15)}>{customer.email}</Text>
                      </Group>
                    </Anchor>
                  )}
                </Group>
              </Stack>
            </Group>

            <Group gap={1} wrap="nowrap">
              <ThemeIcon color="dark" variant="transparent">
                <IconTags strokeWidth={1.5} size={18} />
              </ThemeIcon>
              <Group gap={5} wrap="nowrap">
                {tags.length > 0 ? (
                  <Fragment>
                    {tags
                      .filter((v) => v._id && customer.tagIds?.includes(v._id) === true)
                      .map((tag) => (
                        <Badge
                          key={tag._id}
                          color={tag.color || ""}
                          style={{ cursor: "pointer" }}
                          size="sm"
                          tt="none"
                          onClick={() => modalTagFormRef.current?.open({ tag })}
                        >
                          {tag.name}
                        </Badge>
                      ))}

                    <Popover opened={tagListOpened}>
                      <Popover.Target>
                        <Group
                          gap={0}
                          onClick={() => setTagListOpened(true)}
                          style={{ cursor: "pointer" }}
                        >
                          <ThemeIcon size={13} variant="transparent" color="gray">
                            <IconPlus size={13} />
                          </ThemeIcon>
                          <Text c="gray" fz={12}>
                            <Trans>Tag</Trans>
                          </Text>
                        </Group>
                      </Popover.Target>
                      <Popover.Dropdown p={8} ref={ref}>
                        <Stack gap="md">
                          {tags.map((tag) => {
                            const isTagged = customer.tagIds?.includes(tag._id);

                            return (
                              <Group
                                gap={5}
                                key={tag._id}
                                onClick={() => toggleTag(tag)}
                                style={{ cursor: "pointer" }}
                              >
                                <Center w={20}>
                                  <ColorSwatch color={tag.color || ""} size={20}>
                                    {isTagged && (
                                      <CheckIcon
                                        color="white"
                                        style={{ width: rem(6), height: rem(6) }}
                                      />
                                    )}
                                  </ColorSwatch>
                                </Center>
                                <Text fz={10} fw={500}>
                                  {tag.name}
                                </Text>
                              </Group>
                            );
                          })}

                          <Group
                            gap={5}
                            onClick={() => {
                              modalTagFormRef.current?.open({
                                onCreated: (tag) => toggleTag(tag),
                                type: TagType.Customer,
                              });
                              setTagListOpened(false);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <Center w={20}>
                              <ThemeIcon size={20} variant="outline" color="gray" radius={100}>
                                <IconPlus size={12} />
                              </ThemeIcon>
                            </Center>

                            <Text fz={10} fw={500}>
                              <Trans>Add</Trans>
                            </Text>
                          </Group>
                        </Stack>
                      </Popover.Dropdown>
                    </Popover>
                  </Fragment>
                ) : (
                  <Group
                    gap={0}
                    onClick={() =>
                      modalTagFormRef.current?.open({
                        onCreated: (tag) => toggleTag(tag),
                        type: TagType.Customer,
                      })
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <ThemeIcon size={13} variant="transparent" color="gray">
                      <IconPlus size={13} />
                    </ThemeIcon>
                    <Text c="gray" fz={12}>
                      <Trans>Tag</Trans>
                    </Text>
                  </Group>
                )}
              </Group>
            </Group>

            <WorkspaceMembersInput
              showMainResponsible
              value={customer.assigneeUsers}
              onChange={(users) =>
                assignCustomer({
                  variables: {
                    id: customer._id,
                    input: {
                      userIds: users.map((v) => v.userId),
                    },
                  },
                })
              }
              disabled={!workspace.hasPermission(WorkspacePermission.CUSTOMERS_ASSIGN)}
            />
          </Stack>

          {workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO) && (
            <Group justify="flex-end">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() =>
                  modalCustomerRef.current?.open({ customer: customer, onDone: () => {} })
                }
              >
                <IconPencil size={18} strokeWidth={1.5} />
              </ActionIcon>
            </Group>
          )}
        </Group>
      </Card>

      <ModalCustomer ref={modalCustomerRef} />
      <ModalCustomerRelationshipContacts ref={modalCustomerRelationshipContactsRef} />
      <ModalTagForm ref={modalTagFormRef} />
    </Fragment>
  );
};
