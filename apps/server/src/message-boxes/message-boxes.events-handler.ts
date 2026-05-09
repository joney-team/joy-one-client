import { EventHandler, EventsHandler, EventType } from '../events/events.types';
import { AddMessageInput, MessageAttachmentType } from './messages.types';
import { NotificationIcon } from '../notifications/notifications.types';
import { WorkspacePermission } from '../workspace-roles/workspace-roles.types';
import { MessageBoxEntity } from './entities/message-box.entity';

const clearListPlatformsCache: EventHandler = async (context) => {
  if (!context.event.workspaceId) return;
  await context.messageBoxes.clearListPlatformsCache({
    workspaceId: context.event.workspaceId,
  });
};

export const messageBoxesEventsHandler: EventsHandler = {
  [EventType.MESSAGE_BOX_NEW]: [
    async (context) => {
      if (!context.event.workspaceId || !context.event.ref) return;

      context.queueProducers.notifyNewMessageBoxToZaloGmfGroup({
        messageBoxId: context.event.ref,
        workspaceId: context.event.workspaceId,
      });
    },
  ],
  [EventType.MESSAGE_BOX_WAITING]: [
    async (context) => {
      const box = context.event.data as MessageBoxEntity;
      if (!context.event.workspaceId || !box) return;

      const members = await context.workspaceMembers.getByPermission(
        context.event.workspaceId,
        WorkspacePermission.MESSAGE_BOXES_MANAGER,
      );

      const sender = box.senderName || 'quest';
      let body = '';
      let bodyParams: any = { sender };
      const dto = context.event.data.dto as AddMessageInput;

      if (dto.text) {
        body = dto.text;
      } else {
        if (
          dto.attachments.some((v) => v.type === MessageAttachmentType.IMAGE)
        ) {
          body = 'sent_image';
        } else if (
          dto.attachments.some((v) => v.type === MessageAttachmentType.FILE)
        ) {
          body = 'sent_file_length';
          bodyParams = { sender, length: dto.attachments.length };
        } else if (
          dto.attachments.some((v) => v.type === MessageAttachmentType.STICKER)
        ) {
          body = 'sent_sticker';
        }
      }

      await context.notifications.createMultiple({
        workspaceId: context.event.workspaceId,
        userIds: members.map((v) => v.userId),
        title: `new_message`,
        body,
        bodyParams,
        route: `/message-boxes/${box._id}`,
        icon: NotificationIcon.MESSAGE,
      });
    },
  ],
  [EventType.MESSAGE_BOX_NEW_MESSAGE]: [
    async (context) => {
      const box = context.event.data as MessageBoxEntity;
      if (!context.event.workspaceId || !box) return;
      const dto = context.event.data.dto as AddMessageInput;

      const sender = box.senderName || 'quest';
      let body = '';
      let bodyParams: any = { sender };

      if (dto.text) {
        body = dto.text;
      } else {
        if (
          dto.attachments.some((v) => v.type === MessageAttachmentType.IMAGE)
        ) {
          body = 'sent_image';
        } else if (
          dto.attachments.some((v) => v.type === MessageAttachmentType.FILE)
        ) {
          body = 'sent_file_length';
          bodyParams = { sender, length: dto.attachments.length };
        } else if (
          dto.attachments.some((v) => v.type === MessageAttachmentType.STICKER)
        ) {
          body = 'sent_sticker';
        }
      }

      if (box.assigneeUserId) {
        await context.notifications.create({
          workspaceId: context.event.workspaceId,
          userId: box.assigneeUserId,
          title: 'new_message',
          body,
          bodyParams,
          route: `/message-boxes/${box._id}`,
          icon: NotificationIcon.MESSAGE,
        });
      }
    },
  ],
  [EventType.PLUGIN_ZALO_OA_ACTIVE]: [clearListPlatformsCache],
  [EventType.PLUGIN_ZALO_OA_INACTIVE]: [clearListPlatformsCache],
  [EventType.PLUGIN_ZALO_OA_UPDATED]: [clearListPlatformsCache],
  [EventType.PLUGIN_ZALO_OA_REMOVED]: [clearListPlatformsCache],
  [EventType.PLUGIN_ZALO_OA_ENABLED]: [clearListPlatformsCache],
  [EventType.PLUGIN_ZALO_OA_DISABLED]: [clearListPlatformsCache],
  [EventType.PLUGIN_META_PAGES_UPDATED]: [clearListPlatformsCache],
  [EventType.PLUGIN_META_PAGES_DISCONNECTED]: [clearListPlatformsCache],
  [EventType.PLUGIN_MESSAGE_HUBS_NEW]: [clearListPlatformsCache],
  [EventType.PLUGIN_MESSAGE_HUBS_UPDATED]: [clearListPlatformsCache],
  [EventType.PLUGIN_MESSAGE_HUBS_REMOVED]: [clearListPlatformsCache],
};
