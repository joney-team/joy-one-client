import Sentry from '@sentry/node';
import axios, { AxiosError } from 'axios';
import { configs, IS_DEV, IS_TESTING } from './config/config';

import { AppRequest } from './app.types';
import { colorLog, getErrorMessage } from './utils/log.utils';
import { DateTime } from './utils/date-time';

function alertToDiscord(body: any) {
  if (IS_DEV || !configs.DISCORD_ALERT_WEBHOOK) return;

  axios
    .post(configs.DISCORD_ALERT_WEBHOOK, body)
    .catch((error) => console.error(`Send discord errored.`, error.response));
}

function valueStringify(value: unknown) {
  return typeof value === 'string'
    ? value
    : typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);
}

export function loggerBootstrap() {
  Sentry.init({
    dsn: configs.SENTRY_DSN,
    tracesSampleRate: 0.01,
  });
}

export const logger = {
  info: (
    message: string,
    args?: { fields?: Record<string, unknown>; alert?: boolean },
  ) => {
    if (IS_TESTING) return;

    const timeString = DateTime.format(new Date(), {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    console.info(`👀${colorLog.blue(`[INFO][${timeString}]`)} ${message}`);

    if (args?.fields) {
      Object.entries(args.fields).forEach(([key, value]) =>
        console.log(`• ${key}: ${valueStringify(value)}`),
      );
    }

    if (args?.alert) {
      alertToDiscord({
        embeds: [
          {
            title: `👀[INFO] ${message}`,
            fields: [
              {
                name: 'App',
                value: `\`\`\`${configs.APP_NAME}\`\`\``,
                inline: true,
              },
              {
                name: 'Environment',
                value: `\`\`\`${configs.ENV.toUpperCase()}\`\`\``,
                inline: true,
              },
              {
                name: 'Release',
                value: `\`\`\`${configs.APP_VERSION}\`\`\``,
                inline: true,
              },
              ...(args?.fields
                ? Object.entries(args.fields).map(([key, value]) => ({
                    name: key,
                    value: `\`\`\`${typeof value === 'string' ? value : typeof value === 'object' ? JSON.stringify(value) : String(value)}\`\`\``,
                    inline: false,
                  }))
                : []),
            ],
            color: 3447003,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
  },
  warn: (
    message: string,
    args?: { fields?: Record<string, unknown>; alert?: boolean },
  ) => {
    const timeString = DateTime.format(new Date(), {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    console.info(`⚠️${colorLog.yellow(`[WARN][${timeString}]`)} ${message}`);

    if (args?.fields) {
      Object.entries(args.fields).forEach(([key, value]) =>
        console.log(`• ${key}: ${valueStringify(value)}`),
      );
    }

    if (args?.alert) {
      alertToDiscord({
        embeds: [
          {
            title: `⚠️[WARN] ${message}`,
            fields: [
              {
                name: 'App',
                value: `\`\`\`${configs.APP_NAME}\`\`\``,
                inline: true,
              },
              {
                name: 'Environment',
                value: `\`\`\`${configs.ENV.toUpperCase()}\`\`\``,
                inline: true,
              },
              {
                name: 'Release',
                value: `\`\`\`${configs.APP_VERSION}\`\`\``,
                inline: true,
              },
              ...(args?.fields
                ? Object.entries(args.fields).map(([key, value]) => ({
                    name: key,
                    value: `\`\`\`${typeof value === 'string' ? value : typeof value === 'object' ? JSON.stringify(value) : String(value)}\`\`\``,
                    inline: false,
                  }))
                : []),
            ],
            color: 3447003,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
  },
  error: (
    error: unknown,
    args?: {
      request?: AppRequest;
      fields?: Record<string, unknown>;
      case?: string;
    },
  ) => {
    const fields = args?.fields || {};
    const timeString = DateTime.format(new Date(), {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const message = getErrorMessage(error);

    if (args?.case) {
      fields['Cause'] = args?.case;
    }

    if (args?.request) {
      if (args?.request.workspace) {
        fields['Workspace'] = args?.request.workspace.code;
      }

      if (args?.request.user) {
        fields['User'] = args?.request.user._id.toString();
      }

      if (args?.request.device) {
        fields['Device'] = args?.request.device._id.toString();
      }

      fields['RequestBody'] = args.request.body;
      fields['RequestStatus'] = args.request.statusCode;
    }

    // Log to console
    console.log(`🔴${colorLog.red(`[ERROR][${timeString}]`)} ${message}`);
    Object.entries(fields).forEach(([key, value]) =>
      console.log(`• ${key}: ${valueStringify(value)}`),
    );

    // Stack trace
    const stack =
      error instanceof AxiosError &&
      error.response?.data &&
      typeof error.response.data === 'object'
        ? JSON.stringify(error.response.data)
        : error instanceof Error
          ? error.stack.split('\n').slice(1).join('\n').trim()
          : undefined;

    if (stack) {
      console.error(stack);
    }

    if (!IS_DEV) {
      // Capture error to Sentry
      const captureId = Sentry.captureException(error, {
        extra: {
          data: {
            ...fields,
          },
        },
        contexts: {
          app: {
            app_name: configs.APP_NAME,
            app_version: configs.APP_VERSION,
          },
        },
      });

      // Send error to Discord
      const embedFields = [
        {
          name: 'App',
          value: `\`\`\`${configs.APP_NAME}\`\`\``,
          inline: true,
        },
        {
          name: 'Environment',
          value: `\`\`\`${configs.ENV.toUpperCase()}\`\`\``,
          inline: true,
        },
        {
          name: 'Release',
          value: `\`\`\`${configs.APP_VERSION}\`\`\``,
          inline: true,
        },
        {
          name: 'Capture ID',
          value: `\`\`\`${captureId}\`\`\``,
          inline: false,
        },
        ...Object.entries(fields).map(([key, value]) => ({
          name: key,
          value: `\`\`\`${valueStringify(value)}\`\`\``,
          inline: false,
        })),
      ];

      if (stack) {
        embedFields.push({
          name: 'Stack',
          value: `\`\`\`${stack
            .split('\n')[0]
            .replace(/^at\s+/, '')
            .trim()}\`\`\``,
          inline: false,
        });
      }

      alertToDiscord({
        embeds: [
          {
            title: `🔴[ERROR] ${message}`,
            fields: embedFields,
            color: 16729943,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
  },
};

export function onError<T = any>(func?: string, output?: T): (error: any) => T {
  return (error: any) => {
    logger.error(error, { case: func });
    return output;
  };
}
