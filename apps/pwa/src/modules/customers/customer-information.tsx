import { UsersInput } from "@/components/inputs/users-input";
import { useLayout } from "@/layout/layout-context";
import { OnModalCustomerContacts } from "@/modules/customers/modals/modal-customer-contacts";
import { OnModalCustomerPlainCodeForm } from "@/modules/customers/modals/modal-customer-plain-code-form";
import { OnModalCustomerRelationshipContacts } from "@/modules/customers/modals/modal-customer-relationship-contacts";
import { OnCustomerModal } from "@/modules/customers/customer-modal";
import { OnModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { getCustomerContacts } from "@/modules/customer-contacts/customer-contacts.service";
import { assignCustomer, renderGener, renderGenerIcon, updateCustomer } from "./customer-service";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { onUploadFile, removeFileFromRelativePath } from "@/modules/files/file-service";
import { getDateFormat, num, t } from "@/modules/lang/lang-service";
import { getGoogleMapLink, useLocations } from "@/modules/locations/locations-service";
import { useTags } from "@/modules/tags/tags-context";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { onError } from "@/utils/exceptions.utils";
import { useFetch } from "@/utils/use-fetch.util";
import {
  ActionIcon,
  Anchor,
  Badge,
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
  IconClipboardHeart,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconPlus,
  IconTags,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, useState } from "react";
import { EntityImage } from "../../components/entity-image";
import { Renderer } from "../../components/renderer";

interface CustomerInformationsProps {
  customer: CustomerEntity;
  withBorder?: boolean;
}

export const CustomerInformations: FC<CustomerInformationsProps> = (props) => {
  const [_, renderLocation] = useLocations();
  const viewport = useLayout();
  const workspace = useWorkspace();
  const tags = useTags();
  const isCanUpdateInfo = workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO);

  const { customer } = props;
  const IconGender = renderGenerIcon(customer.gender);

  const [tagListOpened, setTagListOpened] = useState(false);
  const ref = useClickOutside(() => setTagListOpened(false));

  const contacts = useFetch({
    id: `customer-contacts-${customer._id}`,
    fetch: () => getCustomerContacts(customer._id),
  });

  const uploadAvatar = async (file: File) => {
    try {
      const _currentAvatar = customer.avatar;
      const _file = await onUploadFile({ file, compressSize: 1 });
      await updateCustomer(customer._id, { ...customer, avatar: _file.relativePath });
      if (_currentAvatar) await removeFileFromRelativePath(_currentAvatar).catch(onError);
    } catch (error) {
      onError(error);
    }
  };

  const toggleTag = async (tag: TagEntity) => {
    if (customer.tagIds?.includes(tag._id)) {
      updateCustomer(customer._id, {
        ...customer,
        tagIds: (customer.tagIds || []).filter((tagId) => tagId !== tag._id),
      }).catch(onError);
    } else {
      updateCustomer(customer._id, { ...customer, tagIds: [...(customer.tagIds || []), tag._id] }).catch(onError);
    }
  };

  return (
    <Card
      p={10}
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
              onlyRead={!isCanUpdateInfo}
            />

            <Stack gap={5}>
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

              <Text fw={500} fz={em(18)}>
                {customer.name}
              </Text>

              <Group gap={16}>
                {customer.birthday && (
                  <Group gap={1} wrap="nowrap">
                    <ThemeIcon color="dark" variant="transparent">
                      <IconCake strokeWidth={1.5} size={18} />
                    </ThemeIcon>
                    <Text fz={em(15)}>{dayjs(customer.birthday * 1000).format(getDateFormat())}</Text>
                  </Group>
                )}

                {customer.gender && (
                  <Group gap={1} wrap="nowrap">
                    <ThemeIcon color="dark" variant="transparent">
                      <IconGender strokeWidth={1.5} size={18} />
                    </ThemeIcon>
                    <Text fz={em(15)}>{renderGener(customer.gender)}</Text>
                  </Group>
                )}

                {customer.phone && workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT) && (
                  <Anchor href={`tel:${customer.phone}`} c="dark" onClick={(e) => e.stopPropagation()}>
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
                    workspace.type === WorkspaceType.CREDIT &&
                    workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT)
                  }
                >
                  <Anchor
                    c="dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      OnModalCustomerContacts({ contacts: contacts.data! });
                    }}
                  >
                    <Group gap={1} wrap="nowrap">
                      <ThemeIcon color="dark" variant="transparent">
                        <IconAddressBook strokeWidth={1.5} size={18} />
                      </ThemeIcon>
                      <Text fz={em(15)}>
                        {t("contacts")}: {num(contacts.data?.contacts.length)}
                      </Text>
                    </Group>
                  </Anchor>

                  <Anchor
                    c="dark"
                    onClick={(e) => {
                      e.stopPropagation();
                      OnModalCustomerRelationshipContacts({ customer });
                    }}
                  >
                    <Group gap={1} wrap="nowrap">
                      <ThemeIcon color="dark" variant="transparent">
                        <IconAddressBook strokeWidth={1.5} size={18} />
                      </ThemeIcon>
                      <Text fz={em(15)}>
                        {t("customer_relationship_contacts")}: {num(customer.relationshipContacts?.length)}
                      </Text>
                    </Group>
                  </Anchor>
                </Renderer>

                {customer.email && (
                  <Anchor href={`mailto:${customer.email}`} c="dark" onClick={(e) => e.stopPropagation()}>
                    <Group gap={1} wrap="nowrap">
                      <ThemeIcon color="dark" variant="transparent">
                        <IconMail strokeWidth={1.5} size={18} />
                      </ThemeIcon>
                      <Text fz={em(15)}>{customer.email}</Text>
                    </Group>
                  </Anchor>
                )}
              </Group>

              {viewport.view !== "mobile" && (
                <>
                  {customer.medicalHistory.length > 0 && (
                    <Group gap={1} wrap="nowrap">
                      <ThemeIcon color="dark" variant="transparent">
                        <IconClipboardHeart strokeWidth={1.5} size={20} />
                      </ThemeIcon>
                      <Text fz={16}>{customer.medicalHistory.toString().replace(/,/g, ", ")}</Text>
                    </Group>
                  )}

                  {customer.location && (
                    <Anchor href={getGoogleMapLink(customer.location)} target="_blank">
                      <Group gap={1} wrap="nowrap">
                        <ThemeIcon color="dark" variant="transparent">
                          <IconMapPin strokeWidth={1.5} size={18} />
                        </ThemeIcon>
                        <Text fz={16}>{renderLocation(customer.location)}</Text>
                      </Group>
                    </Anchor>
                  )}
                </>
              )}
            </Stack>
          </Group>

          {viewport.view === "mobile" && (
            <>
              {customer.medicalHistory.length > 0 && (
                <Group gap={1} wrap="nowrap">
                  <ThemeIcon color="dark" variant="transparent">
                    <IconClipboardHeart strokeWidth={1.5} size={20} />
                  </ThemeIcon>
                  <Text fz={16}>{customer.medicalHistory.toString().replace(/,/g, ", ")}</Text>
                </Group>
              )}

              {customer.location && (
                <Group gap={1} wrap="nowrap">
                  <ThemeIcon color="dark" variant="transparent">
                    <IconMapPin strokeWidth={1.5} size={18} />
                  </ThemeIcon>
                  <Text fz={16}>{renderLocation(customer.location)}</Text>
                </Group>
              )}
            </>
          )}

          <Group gap={1} wrap="nowrap">
            <ThemeIcon color="dark" variant="transparent">
              <IconTags strokeWidth={1.5} size={18} />
            </ThemeIcon>
            <Group gap={5} wrap="nowrap">
              {tags.list.length > 0 ? (
                <>
                  {tags.list
                    .filter((v) => v._id && customer.tagIds?.includes(v._id) === true && v.type === TagType.CUSTOMER)
                    .map((tag) => (
                      <Badge
                        key={tag._id}
                        color={tag.color || ""}
                        style={{ cursor: "pointer" }}
                        size="sm"
                        tt="none"
                        onClick={() => OnModalTagForm({ tag, type: TagType.CUSTOMER })}
                      >
                        {tag.name}
                      </Badge>
                    ))}

                  <Popover opened={tagListOpened}>
                    <Popover.Target>
                      <Group gap={0} onClick={() => setTagListOpened(true)} style={{ cursor: "pointer" }}>
                        <ThemeIcon size={13} variant="transparent" color="gray">
                          <IconPlus size={13} />
                        </ThemeIcon>
                        <Text c="gray" fz={12}>
                          {t("tag")}
                        </Text>
                      </Group>
                    </Popover.Target>
                    <Popover.Dropdown p={8} ref={ref}>
                      <Stack gap={16}>
                        {tags.list
                          .filter((v) => v._id && v.type === TagType.CUSTOMER)
                          .map((tag) => {
                            const isTagged = customer.tagIds?.includes(tag._id);

                            return (
                              <Group gap={5} key={tag._id} onClick={() => toggleTag(tag)} style={{ cursor: "pointer" }}>
                                <Center w={20}>
                                  <ColorSwatch color={tag.color || ""} size={20}>
                                    {isTagged && <CheckIcon color="white" style={{ width: rem(6), height: rem(6) }} />}
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
                            OnModalTagForm({ onDone: (tag) => toggleTag(tag), type: TagType.CUSTOMER });
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
                            {t("add")}
                          </Text>
                        </Group>
                      </Stack>
                    </Popover.Dropdown>
                  </Popover>
                </>
              ) : (
                <Group
                  gap={0}
                  onClick={() => OnModalTagForm({ onDone: (tag) => toggleTag(tag), type: TagType.CUSTOMER })}
                  style={{ cursor: "pointer" }}
                >
                  <ThemeIcon size={13} variant="transparent" color="gray">
                    <IconPlus size={13} />
                  </ThemeIcon>
                  <Text c="gray" fz={12}>
                    {t("tag")}
                  </Text>
                </Group>
              )}
            </Group>
          </Group>

          <UsersInput
            showMainResponsible
            value={customer.assigneeUsers}
            onChange={(users) => assignCustomer(customer._id, { userIds: users.map((v) => v.userId) })}
            disabled={!workspace.hasPermission(WorkspacePermission.CUSTOMERS_ASSIGN)}
          />
        </Stack>

        {workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO) && (
          <Group justify="flex-end">
            <ActionIcon
              variant="transparent"
              color="gray"
              onClick={() => OnCustomerModal({ customer: customer, onDone: () => {} })}
              style={{ marginRight: -5, marginTop: -3 }}
            >
              <IconPencil size={22} strokeWidth={1.5} />
            </ActionIcon>
          </Group>
        )}
      </Group>
    </Card>
  );
};
