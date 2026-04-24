import type { Metadata } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import './globals.css'
import { InventoryProvider } from '@/context/InventoryContext'
import { ConfigProvider } from '@/context/ConfigContext'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cost Savings Calculator | Eastern Extinguishers',
  description:
    'See how much your business could save over 8 years by switching to P50 composite fire extinguishers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body className="bg-gray-50 font-body antialiased">
        <ConfigProvider>
          <InventoryProvider>{children}</InventoryProvider>
        </ConfigProvider>
      </body>
    </html>
  )
}
