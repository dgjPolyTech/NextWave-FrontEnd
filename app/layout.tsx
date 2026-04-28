import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { NavigationProvider } from '@/hooks/use-navigation'
import { SidebarWrapper } from '@/components/sidebar-wrapper'
import { Toaster } from '@/components/ui/toaster'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'NextWave - 팀 협업 플랫폼',
  description: '일정 관리, 협업 메모, 팀 협업을 위한 올인원 플랫폼',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/wave-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/wave-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/wave.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/wave-light.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="bg-background">
      <body className="font-sans antialiased">
        <NavigationProvider>
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </NavigationProvider>
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
