import type { WorkSlot, AppMetadata } from "@/types";

import { defaultMetadata } from "@/configs/metadata.config";
import dayjs from "dayjs";
import { renderLink } from "../files/files-utils";
import { MainServerRequest } from "../requests/main.server-request";
import type { WorkspaceEntity } from "./workspaces-types";

export function isInWorkSlots(slots?: WorkSlot[], date?: Date) {
  if (!slots || slots.length === 0) return true;
  const _date = date ? new Date(date) : new Date();

  const matchedSlot = slots.find(slot => {
    const slotStartDate = dayjs().hour(slot.startHour).minute(slot.startMin).toDate();
    const slotEndDate = dayjs().hour(slot.endHour).minute(slot.endMin).toDate();
    const isSameDay = slotStartDate.getDay() === _date.getDay();
    if (!isSameDay) return false;

    const startTimeSeconds = 60 * 60 * slotStartDate.getHours() + 60 * slotStartDate.getMinutes();
    const endTimeSeconds = 60 * 60 * slotEndDate.getHours() + 60 * slotEndDate.getMinutes();
    const targetSeconds = 60 * 60 * _date.getHours() + 60 * _date.getMinutes();

    return startTimeSeconds <= targetSeconds && targetSeconds <= endTimeSeconds;
  })

  return !!matchedSlot;
}

export function encodeWorkspace(params: { workspaceCode: string, code: string, entity: string }) {
  return `${params.workspaceCode}${params.code}${params.entity}`;
}

export function decodeWorkspace(input: string, plainCode?: string) {
  // Validate input
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string.');
  }

  // Regex to match code
  const regex = /^([A-Z]+)(\d+)([A-Z]*)$/;
  const match = input.match(regex);

  if (!match) {
    throw new Error('Invalid code format.');
  }

  // Extract workspace code, code, and entity
  const workspaceCode = match[1];
  const code = match[2];
  const entity = match[3];

  return { workspaceCode, code: plainCode || code, entity, count: +code };
}

export function renderEntityCode(workspaceCode?: string, plainCode?: string) {
  if (!workspaceCode) return plainCode || '';
  if (plainCode) return plainCode || '';

  try {
    const decoded = decodeWorkspace(workspaceCode);
    return `#${decoded.workspaceCode}${decoded.code}`;
  } catch (error) {
    return workspaceCode || '';
  }
}

let metadatas: { [metdataKey: string]: AppMetadata } = {};

export async function getWorkspaceMetadata(args: {
  host?: string;
  workspaceId?: string;
}) {
  const metadataKey = args.workspaceId || args.host;

  if (!metadataKey) return defaultMetadata;
  if (metadataKey && metadatas[metadataKey]) return metadatas[metadataKey];

  const url = args.workspaceId ? `/workspaces/ids/${args.workspaceId}`
    : `/workspaces/domains/${args.host}`;

  const workspace = await MainServerRequest.get<WorkspaceEntity>(url)
    .catch((error) => {
      console.error(`[${new Date().toLocaleTimeString('vi')}] getWorkspaceMetadata error`, error.message);
      return null;
    });

  if (metadataKey && workspace) {
    const metadata: AppMetadata = {
      ...defaultMetadata,
      title: workspace.appName || 'JoyOne',
      siteName: workspace.appName || 'JoyOne',
      favicon: renderLink(workspace.appIcon) || '/favicon.ico',
      webURL: `https://${workspace.appDomain}`,
      appColor: workspace.appColor,
      appColorShape: workspace.appColorShape,
      appName: workspace.appName,
      workspaceId: workspace._id,
      isExtended: true,
      thumbnailURL: renderLink(workspace.cover || workspace.appIcon || defaultMetadata.thumbnailURL),
      appIcon: renderLink(workspace.appIcon || defaultMetadata.appIcon),
    };

    return metadata;
  }

  return defaultMetadata;
}