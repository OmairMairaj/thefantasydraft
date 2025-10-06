import "./globals.css";
import Nav from "../components/Nav/Nav";
import Footer from "../components/Footer/Footer";
import Provider from "./provider";
import Head from "next/head";

export const metadata = {
  title: 'The Fantasy Draft',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '512x512', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest', // optional PWA manifest (put this file in /public)
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Head>
      <body className="m-auto flex flex-col items-center max-w-[100rem]">
        <Provider>
          <div className="w-full">
            <header>
              <Nav />
            </header>
            <main>
              {children}
            </main>
            <footer>
              <Footer />
            </footer>
          </div>
        </Provider>
      </body>
    </html>
  );
}
