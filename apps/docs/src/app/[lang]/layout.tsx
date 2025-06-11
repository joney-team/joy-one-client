/* eslint-env node */
import type { Metadata } from "next";
import { Footer, LastUpdated, Layout, LocaleSwitch, Navbar } from "nextra-theme-docs";
import { Head, Image } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import type { FC, ReactNode } from "react";
import { getDictionary, getDirection } from "../_dictionary/get-dictionary";
import { Locale } from "../_dictionary/i18n-config";

import "./styles.css";

export const metadata: Metadata = {
  description: "Work management tool - Business management tool - Customer care tool",
  title: {
    absolute: "JoyOne",
    template: "%s | JoyOne",
  },
  metadataBase: new URL("https://joyone.com"),
  icons: {
    icon: "/favicon.ico",
  },
};

type LayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{
    lang: string;
  }>;
}>;

const RootLayout: FC<LayoutProps> = async ({ children, params }: LayoutProps) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  let pageMap = await getPageMap(`/${lang}`);

  // const banner = (
  //   <Banner storageKey="swr-2">
  //     SWR 2.0 is out! <Link href="#">Read more →</Link>
  //   </Banner>
  // )

  const navbar = (
    <Navbar
      logo={
        <div className="navbar-logo">
          <Image src="/symbol.png" alt="JoyOne" width={32} height={32} />
          <div className="brand">
            <h1 className="name">Joy One</h1>
            <p className="slogan">Enjoy Work in One App</p>
          </div>
        </div>
      }
      projectLink="https://github.com/vercel/swr"
      chatLink="https://discord.com"
    >
      <LocaleSwitch lite />
    </Navbar>
  );
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
  );
  return (
    <html lang={lang} dir={getDirection(lang as Locale)} suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          // banner={banner}
          navbar={navbar}
          footer={footer}
          docsRepositoryBase="https://github.com/joyone/joyone-docs"
          i18n={[
            { locale: "en", name: "English" },
            { locale: "vi", name: "Tiếng Việt" },
          ]}
          sidebar={{
            defaultMenuCollapseLevel: 1,
            autoCollapse: true,
          }}
          toc={{
            backToTop: dictionary.backToTop,
          }}
          editLink={dictionary.editPage}
          pageMap={pageMap}
          nextThemes={{ defaultTheme: "system" }}
          lastUpdated={<LastUpdated>{dictionary.lastUpdated}</LastUpdated>}
          themeSwitch={{
            dark: dictionary.dark,
            light: dictionary.light,
            system: dictionary.system,
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
};

export default RootLayout;
