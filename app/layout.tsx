import '#/styles/globals.css';
import { AddressBar } from '#/ui/address-bar';
import Byline from '#/ui/byline';
import { GlobalNav } from '#/ui/global-nav';
import { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: {
    default: 'FunctionCalling.fun',
    template: '%s | functioncalling.fun',
  },
  description:
    'Serverless GPT Function Calling. Call functions with GPT-3. Create your own functions. Explore demos.',
  openGraph: {
    title: 'FunctionCalling.fun',
    description:
      'Serverless GPT Function Calling. Call functions with GPT-3. Create your own functions. Explore demos.',
    images: [`/functionfun.001.jpeg`],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="[color-scheme:dark]">
      <body className="bg-gray-1100 overflow-y-scroll bg-[url('/grid.svg')] pb-36">
        <GlobalNav />

        <div className="mx-auto max-w-4xl space-y-8 px-2 pt-20 lg:px-8 lg:py-8">
          <div className="bg-vc-border-gradient rounded-lg p-px shadow-lg shadow-black/20">
            <div className="rounded-lg bg-black">
              <AddressBar />
            </div>
          </div>

          <div className="bg-vc-border-gradient rounded-lg p-px shadow-lg shadow-black/20">
            <div className="rounded-lg bg-black p-3.5 lg:p-6">{children}</div>
          </div>
          <Byline className="fixed sm:hidden" />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
