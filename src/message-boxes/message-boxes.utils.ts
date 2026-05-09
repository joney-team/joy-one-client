import { MessageBoxPlatformType } from './message-boxes.types';

export function getPlatformLabel(platformType?: MessageBoxPlatformType) {
  if (platformType === MessageBoxPlatformType.META_PAGE) return 'Fanpage';
  if (platformType === MessageBoxPlatformType.ZALO) return 'Zalo OA';
  if (platformType === MessageBoxPlatformType.MESSAGE_HUB) return 'Message Hub';
}
