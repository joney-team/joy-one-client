import type { AppMetadata } from "@/types";

import { defaultMetadata } from "@/configs/metadata.config";
import { restServerClient } from "../apis/server";
import { renderFileUrl } from "../files/files-utils";
import type { WorkspaceEntity } from "./workspaces-types";

export function encodeWorkspace(params: { workspaceCode: string; code: string; entity: string }) {
  return `${params.workspaceCode}${params.code}${params.entity}`;
}

export function decodeWorkspace(input: string, plainCode?: string) {
  // Validate input
  if (typeof input !== "string" || input.length === 0) {
    throw new Error("Input must be a non-empty string.");
  }

  // Regex to match code
  const regex = /^([A-Z]+)(\d+)([A-Z]*)$/;
  const match = input.match(regex);

  if (!match) {
    throw new Error("Invalid code format.");
  }

  // Extract workspace code, code, and entity
  const workspaceCode = match[1];
  const code = match[2];
  const entity = match[3];

  return { workspaceCode, code: plainCode || code, entity, count: +code };
}

export function renderEntityCode(workspaceCode?: string, plainCode?: string | null) {
  if (!workspaceCode) return plainCode || "";
  if (plainCode) return plainCode || "";

  try {
    const decoded = decodeWorkspace(workspaceCode);
    return `#${decoded.workspaceCode}${decoded.code}`;
  } catch (error) {
    return workspaceCode || "";
  }
}

let metadatas: { [metdataKey: string]: AppMetadata } = {};

export async function getWorkspaceMetadata(args: { host?: string; workspaceId?: string }) {
  const metadataKey = args.workspaceId || args.host;

  if (!metadataKey) return defaultMetadata;
  if (metadataKey && metadatas[metadataKey]) return metadatas[metadataKey];

  const url = args.workspaceId
    ? `/workspaces/ids/${args.workspaceId}`
    : `/workspaces/domains/${args.host}`;

  const workspace = await restServerClient.get<WorkspaceEntity>(url).catch((error) => {
    console.error(
      `[${new Date().toLocaleTimeString("vi")}] getWorkspaceMetadata error`,
      error.message,
    );
    return null;
  });

  if (metadataKey && workspace) {
    const metadata: AppMetadata = {
      ...defaultMetadata,
      title: workspace.appName || "JoyOne",
      siteName: workspace.appName || "JoyOne",
      favicon: renderFileUrl(workspace.appIcon) || "/favicon.ico",
      webURL: `https://${workspace.appDomain}`,
      appColor: workspace.appColor ?? "",
      appColorShape: workspace.appColorShape,
      appName: workspace.appName ?? "",
      workspaceId: workspace._id,
      isExtended: true,
      thumbnailURL: renderFileUrl(
        workspace.cover || workspace.appIcon || defaultMetadata.thumbnailURL,
      ),
      appIcon: renderFileUrl(workspace.appIcon || defaultMetadata.appIcon),
    };

    return metadata;
  }

  return defaultMetadata;
}
