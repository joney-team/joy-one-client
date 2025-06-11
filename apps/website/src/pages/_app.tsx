// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import dayjs from "dayjs";

import { CONFIG } from '@/app.config';
import { ChatBox } from '@/components/chatbox';
import { createTheme, MantineColorsTuple, MantineProvider } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ['latin'] })

const primaryColor: MantineColorsTuple = [
  '#e5f4ff',
  '#cde2ff',
  '#9bc2ff',
  '#64a0ff',
  '#3984fe',
  '#1d72fe',
  '#0969ff',
  '#0058e4',
  '#004ecc',
  '#0043b5'
];

const theme = createTheme({
  colors: {
    primary: primaryColor,
  },
  fontSizes: {
    sm: "16px",
  },
  primaryColor: 'primary',
  components: {
    InputWrapper: {
      defaultProps: {
        styles: {
          label: {
            fontSize: 11
          }
        }
      },
    },
    Select: {
      defaultProps: {
        styles: {
          label: {
            fontSize: 11
          }
        }
      },
    },
    TagsInput: {
      defaultProps: {
        styles: {
          label: {
            fontSize: 11
          }
        }
      },
    },
    PasswordInput: {
      defaultProps: {
        styles: {
          label: {
            fontSize: 11
          }
        }
      },
    },
    Modal: {
      defaultProps: {
        closeButtonProps: {
          icon: <IconX strokeWidth={1.5} size={25} />
        }
      }
    }
  }
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  dayjs.locale(router.locale);

  const configs = {
    title: 'Joy One',
    webURL: CONFIG.PUBLIC_URL,
    thumbnailURL: `${CONFIG.PUBLIC_URL}/images/thumbnail.png`,
    description: "Enjoy Work In One App",
    siteName: 'Joy One App',
    type: 'website',
    favicon: '/favicon.ico'
  }

  return (
    <main className={inter.className}>
      <Head>
        <title>{configs.title}</title>

        <link rel='canonical' href={configs.webURL} />
        <meta name='description' content={configs.description} />
        <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />

        {/* Facebook */}
        <meta property='og:title' content={configs.title} />
        <meta property='og:description' content={configs.description} />
        <meta property='og:image' content={configs.thumbnailURL} />
        <meta property='og:image:url' content={configs.thumbnailURL} />
        <meta property='og:url' content={configs.webURL} />
        <meta property='og:site_name' content={configs.siteName} />
        <meta property='og:type' content={configs.type} />

        <link as='image' href={configs.thumbnailURL} rel='preload' />
        <link rel="icon" type="image/x-icon" href={configs.favicon} />
      </Head>
      <MantineProvider theme={theme}>
        <Component {...pageProps} />
        <ChatBox />
      </MantineProvider>
    </main>
  );
}