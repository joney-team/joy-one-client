/* eslint-env node */
import type { Metadata } from 'next'
import {
  Footer,
  LastUpdated,
  Layout,
  Link,
  LocaleSwitch,
  Navbar
} from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { FC, ReactNode } from 'react'
import { getDictionary, getDirection } from '../_dictionary/get-dictionary'
import { Locale } from '../_dictionary/i18n-config'

import './styles.css'

export const metadata: Metadata = {
  description:
    'SWR is a React Hooks library for data fetching. SWR first returns the data from cache (stale), then sends the fetch request (revalidate), and finally comes with the up-to-date data again.',
  title: {
    absolute: '',
    template: '%s | SWR'
  },
  metadataBase: new URL('https://joyone.com'),
}

type LayoutProps = Readonly<{
  children: ReactNode
  params: Promise<{
    lang: string
  }>
}>

const RootLayout: FC<LayoutProps> = async ({ children, params }: LayoutProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang as Locale)
  let pageMap = await getPageMap(`/${lang}`)

  const banner = (
    <Banner storageKey="swr-2">
      SWR 2.0 is out! <Link href="#">Read more →</Link>
    </Banner>
  )
  const navbar = (
    <Navbar
      logo={
        <>
          <span>Joy One</span>
          <span
            className="ms-2 select-none font-extrabold max-md:hidden"
            title={`SWR: ${dictionary.logo.title}`}
          >
            SWR
          </span>
        </>
      }
      projectLink="https://github.com/vercel/swr"
      chatLink="https://discord.com"
    >
      <LocaleSwitch lite />
    </Navbar>
  )
  const footer = (
    <Footer>
      <a
        rel="noreferrer"
        target="_blank"
        className="x:focus-visible:nextra-focus flex items-center gap-2 font-semibold"
        href={dictionary.link.vercel}
      >
        {dictionary.poweredBy} <span>Joy One</span>
      </a>
    </Footer>
  )
  return (
    <html lang={lang} dir={getDirection(lang as Locale)} suppressHydrationWarning>
      <Head/>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          footer={footer}
          docsRepositoryBase="https://github.com/joyone/joyone-docs"
          i18n={[
            { locale: 'en', name: 'English' },
            { locale: 'vi', name: 'Tiếng Việt' }
          ]}
          sidebar={{
            defaultMenuCollapseLevel: 1,
            autoCollapse: true
          }}
          toc={{
            backToTop: dictionary.backToTop,
          }}
          editLink={dictionary.editPage}
          pageMap={pageMap}
          nextThemes={{ defaultTheme: 'dark' }}
          lastUpdated={<LastUpdated>{dictionary.lastUpdated}</LastUpdated>}
          themeSwitch={{
            dark: dictionary.dark,
            light: dictionary.light,
            system: dictionary.system
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}

export default RootLayout