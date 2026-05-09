import { Injectable } from '@nestjs/common';
import { AppConfig, AppDebug } from './app.types';
import { configs } from './config/config';

@Injectable()
export class AppService {
  debug: AppDebug = {
    router: false,
  };

  config(): AppConfig {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const timezoneOffsetInMinutes = now.getTimezoneOffset();
    const timezoneOffsetInHours = timezoneOffsetInMinutes / 60;
    const formattedTimezoneOffset =
      (timezoneOffsetInHours > 0 ? '-' : '+') + Math.abs(timezoneOffsetInHours);

    return {
      name: configs.APP_NAME,
      version: configs.APP_VERSION,
      timeZone,
      UTC: formattedTimezoneOffset,
      workspaceDomainIP: '',
      metaAppId: configs.META_APP_ID,
      metaAppVersion: configs.META_APP_VERSION,
      metaAppScope: [
        'pages_show_list',
        'pages_manage_metadata',
        'pages_messaging',
        'pages_read_engagement',
        'public_profile',
      ],
      zaloAppId: configs.ZALO_APP_ID,
    };
  }

  setDebug(debug: AppDebug) {
    this.debug = debug;
  }
}
