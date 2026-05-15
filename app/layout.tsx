import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { SessionProvider } from "@/components/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Splitly Lead — Teste A/B para Tráfego Pago",
  description:
    "Divida seu tráfego entre múltiplas landing pages com um único link. Descubra qual oferta é mais lucrativa.",
  icons: {
    icon: "/logo-square.png",
  },
  openGraph: {
    title: "Splitly Lead — Teste A/B para Tráfego Pago",
    description:
      "Divida seu tráfego entre múltiplas landing pages com um único link. Descubra qual oferta é mais lucrativa.",
    images: ["/logo-square.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
