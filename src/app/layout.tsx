import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/ui/Header"
import { ClientProviders } from "./ClientProviders"
import { getUser } from "@/lib/supabase/getUser"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const viewport: Viewport = {
  themeColor: "#78350f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: "もくカフェ",
  description: "カフェで作業仲間を見つけよう",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "もくカフェ",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { data: { user } } = await getUser()
  const isLoggedIn = !!user && !user.is_anonymous

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-100">
        <Header />
        <main className="flex-1">{children}</main>
        <ClientProviders isLoggedIn={isLoggedIn} />
      </body>
    </html>
  )
}
