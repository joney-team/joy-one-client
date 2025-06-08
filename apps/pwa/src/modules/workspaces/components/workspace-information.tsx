import { Avatar } from "@/components/avatar";
import { TextInput } from "@/components/inputs/text-input";
import { onUploadFile, removeFileFromRelativePath } from "@/modules/files/file-service";
import { t } from "@/modules/lang/lang-service";
import { useLocations } from "@/modules/locations/locations-service";
import { optionsFilter } from "@/modules/theme/generator";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getWorkspaceTypeIcon } from "@/modules/workspaces/workspaces-service";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { onError } from "@/utils/exceptions.utils";
import { Anchor, Group, InputWrapper, LoadingOverlay, Select, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { IconUpload } from "@tabler/icons-react";
import { FC, useState } from "react";
import { WorkspaceTypeItem } from "./workpsace-type-item";

let timeout: NodeJS.Timeout;
export const WorkspaceInformation: FC = () => {
  const workspace = useWorkspace();
  const [locations, renderLocation] = useLocations();
  const [avatarUploading, setAvatarUploading] = useState(false);

  const form = useForm({
    initialValues: {
      ...workspace.userMember.workspace,
      name: workspace.userMember?.workspace?.name || "",
      phone: workspace.userMember?.workspace?.phone || "",
      hotline: workspace.userMember?.workspace?.hotline || "",
      location: workspace.userMember?.workspace?.location || {
        address: "",
      },
    },
    onValuesChange: (values) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        workspace.update(values).catch(onError);
      }, 300);
    },
  });

  const handleUploadLogo = async (file: File) => {
    setAvatarUploading(true);
    try {
      const currentAvatar = workspace.userMember?.workspace?.logo;
      const _file = await onUploadFile({ file, maxWidthOrHeight: 300 });
      await workspace.update({ ...workspace.userMember, logo: _file.relativePath } as any);
      if (currentAvatar) await removeFileFromRelativePath(currentAvatar).catch(() => false);
    } catch (error) {
      onError(error);
    }
    setAvatarUploading(false);
  };

  if (workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS))
    return (
      <Stack className="WorkspaceForm">
        <Dropzone
          accept={IMAGE_MIME_TYPE}
          onDrop={(files) => {
            if (!files.length) return;
            handleUploadLogo(files[0]);
          }}
          multiple={false}
        >
          <Group style={{ position: "relative" }} wrap="nowrap">
            <LoadingOverlay visible={avatarUploading} loaderProps={{ size: "xs" }} />
            <Avatar src={workspace.userMember?.workspace?.logo} size={80}>
              {workspace.userMember?.name?.slice(0, 2)}
            </Avatar>

            <Group gap={5}>
              <ThemeIcon variant="transparent" color="dark" size="md">
                <IconUpload strokeWidth={1.2} />
              </ThemeIcon>
              <Text fz={12}>{t("click_to_change")}</Text>
            </Group>
          </Group>
        </Dropzone>

        <TextInput label="Tên" {...form.getInputProps("name")} placeholder="Gold Dental" />

        <SimpleGrid cols={{ md: 2 }}>
          <TextInput label={t("phone")} {...form.getInputProps("phone")} placeholder="090888888" />
          <TextInput label="Hotline" {...form.getInputProps("hotline")} placeholder="19008088" />
        </SimpleGrid>

        <Select
          label={t("province")}
          {...form.getInputProps("location.provinceId")}
          searchable
          data={locations.filter((l) => l.type === "province").map((l) => ({ value: l.id, label: l.name }))}
          onChange={(e) => {
            form.setFieldValue("location.provinceId", e!);
            form.setFieldValue("location.districtId", "");
            form.setFieldValue("location.wardId", "");
          }}
          filter={optionsFilter}
        />

        <Group wrap="nowrap">
          <Select
            label={t("district")}
            {...form.getInputProps("location.districtId")}
            searchable
            data={locations
              .filter((l) => l.type === "district" && l.parentId === form.values.location?.provinceId)
              .map((l) => ({ value: l.id, label: l.fullName }))}
            onChange={(e) => {
              form.setFieldValue("location.districtId", e!);
              form.setFieldValue("location.wardId", "");
            }}
            flex={1}
            filter={optionsFilter}
          />

          <Select
            label={t("ward")}
            {...form.getInputProps("location.wardId")}
            searchable
            data={locations
              .filter((l) => l.type === "ward" && l.parentId === form.values.location?.districtId)
              .map((l) => ({ value: l.id, label: l.fullName }))}
            flex={1}
            filter={optionsFilter}
          />
        </Group>

        <TextInput label={t("address")} {...form.getInputProps("location.address")} />

        <InputWrapper label={t("workspace_type")} {...form.getInputProps("type")}>
          <Group gap={10} pt={5}>
            {Object.values(WorkspaceType).map((type) => {
              return (
                <WorkspaceTypeItem
                  key={type}
                  icon={getWorkspaceTypeIcon(type)}
                  label={t(`ws_t_${type}`).toString()}
                  isActive={form.values.type === type}
                  onClick={() => form.setFieldValue("type", type)}
                />
              );
            })}
          </Group>
        </InputWrapper>
      </Stack>
    );

  return (
    <Stack>
      <Group wrap="nowrap">
        <Group style={{ position: "relative" }}>
          <LoadingOverlay visible={avatarUploading} loaderProps={{ size: "xs" }} />
          <Avatar src={workspace.userMember?.workspace?.logo} size={60}>
            {workspace.userMember?.name?.slice(0, 2)}
          </Avatar>
        </Group>

        <Stack gap={5}>
          <Text fw={500}>{workspace.userMember?.name}</Text>
          {workspace.userMember?.workspace?.hotline && (
            <Anchor href={`tel:${workspace.userMember?.workspace.hotline}`} c="dark">
              <Text fz={12}>Hotline: {workspace.userMember?.workspace.hotline}</Text>
            </Anchor>
          )}
          {workspace.userMember?.workspace?.location && (
            <Text fz={12}>Địa chỉ: {renderLocation(workspace.userMember.workspace.location)}</Text>
          )}
        </Stack>
      </Group>
    </Stack>
  );
};
