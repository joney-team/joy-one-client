import { AxiosError } from 'axios';
import { DateTime } from './date-time';

export function tableLog(
  data: Object,
  config?: {
    [key: string]: {
      convertTime?: boolean;
      convertHHMMSS?: boolean;
    };
  },
) {
  const _config = config || {};

  console.table(
    Object.keys(data).map((key) => {
      return {
        key: key,
        value: (function () {
          if (typeof data[key] === 'object') {
            return JSON.stringify(data[key], null, 2);
          }

          if (typeof data[key] === 'number' && _config[key]?.convertHHMMSS) {
            return `${DateTime.toHHMMSS(Math.abs(data[key]))} (${data[key]})`;
          }

          if (typeof data[key] === 'number' && _config[key]?.convertTime) {
            const date = new Date(data[key] * 1000);
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} (${data[key]})`;
          }

          return data[key];
        })(),
      };
    }),
  );
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
} as const;

export const colorLog = {
  // Basic colors
  red: (message: string) => `${colors.red}${message}${colors.reset}`,
  green: (message: string) => `${colors.green}${message}${colors.reset}`,
  yellow: (message: string) => `${colors.yellow}${message}${colors.reset}`,
  blue: (message: string) => `${colors.blue}${message}${colors.reset}`,
  magenta: (message: string) => `${colors.magenta}${message}${colors.reset}`,
  cyan: (message: string) => `${colors.cyan}${message}${colors.reset}`,
  white: (message: string) => `${colors.white}${message}${colors.reset}`,
  gray: (message: string) => `${colors.gray}${message}${colors.reset}`,

  // Bright colors
  brightRed: (message: string) =>
    `${colors.bright}${colors.red}${message}${colors.reset}`,
  brightGreen: (message: string) =>
    `${colors.bright}${colors.green}${message}${colors.reset}`,
  brightYellow: (message: string) =>
    `${colors.bright}${colors.yellow}${message}${colors.reset}`,
  brightBlue: (message: string) =>
    `${colors.bright}${colors.blue}${message}${colors.reset}`,
  brightMagenta: (message: string) =>
    `${colors.bright}${colors.magenta}${message}${colors.reset}`,
  brightCyan: (message: string) =>
    `${colors.bright}${colors.cyan}${message}${colors.reset}`,
  brightWhite: (message: string) =>
    `${colors.bright}${colors.white}${message}${colors.reset}`,

  // Dim colors
  dimRed: (message: string) =>
    `${colors.dim}${colors.red}${message}${colors.reset}`,
  dimGreen: (message: string) =>
    `${colors.dim}${colors.green}${message}${colors.reset}`,
  dimYellow: (message: string) =>
    `${colors.dim}${colors.yellow}${message}${colors.reset}`,
  dimBlue: (message: string) =>
    `${colors.dim}${colors.blue}${message}${colors.reset}`,
  dimMagenta: (message: string) =>
    `${colors.dim}${colors.magenta}${message}${colors.reset}`,
  dimCyan: (message: string) =>
    `${colors.dim}${colors.cyan}${message}${colors.reset}`,
  dimWhite: (message: string) =>
    `${colors.dim}${colors.white}${message}${colors.reset}`,

  // Background colors
  bgRed: (message: string) => `${colors.bgRed}${message}${colors.reset}`,
  bgGreen: (message: string) => `${colors.bgGreen}${message}${colors.reset}`,
  bgYellow: (message: string) => `${colors.bgYellow}${message}${colors.reset}`,
  bgBlue: (message: string) => `${colors.bgBlue}${message}${colors.reset}`,
  bgMagenta: (message: string) =>
    `${colors.bgMagenta}${message}${colors.reset}`,
  bgCyan: (message: string) => `${colors.bgCyan}${message}${colors.reset}`,
  bgWhite: (message: string) => `${colors.bgWhite}${message}${colors.reset}`,

  // Utility methods
  bold: (message: string) => `${colors.bright}${message}${colors.reset}`,
  dim: (message: string) => `${colors.dim}${message}${colors.reset}`,
  reset: (message: string) => `${colors.reset}${message}${colors.reset}`,
};

export const cleanColorLog = (message: string) => {
  return message.replace(/\x1b\[[0-9;]*m/g, '');
};

const parseLogToString = (log: any): string => {
  if (!log) return '';
  if (typeof log === 'string') return log;
  if (typeof log === 'object') return JSON.stringify(log);
  if (Array.isArray(log)) return log.map(parseLogToString).join(', ');
};

export const logObj = (obj: any) => {
  if (typeof obj !== 'object') return;
  return Object.keys(obj).reduce((output, key, index) => {
    return (
      output +
      `  • ${key}: ${parseLogToString(obj[key])} ${index === Object.keys(obj).length - 1 ? '' : '\n'}`
    );
  }, '\n');
};

export const getErrorMessage = (error: any) => {
  try {
    if (error instanceof Error) {
      return error.message;
    }

    if (error instanceof AxiosError) {
      return (
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        error.message
      );
    }

    return String(error);
  } catch (error) {
    return 'Unknown error';
  }
};
