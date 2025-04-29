import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "@/components/client-layout"
import '@iota/dapp-kit/dist/index.css';

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Asseta - Tokenize Real-World Assets on IOTA",
  description: "Tokenize and trade real-world assets on IOTA's Tangle",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white`} suppressHydrationWarning>
        <ClientLayout>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <main className="flex-1 bg-white">{children}</main>
          </div>
        </ThemeProvider>
        </ClientLayout>
      </body>
    </html>
  )
}
