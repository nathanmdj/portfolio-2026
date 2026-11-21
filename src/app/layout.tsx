import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import { documentBootstrap } from "@/lib/document-bootstrap";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const description = `${profile.headline} ${profile.subhead}`;

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.title}`,
  description,
  openGraph: {
    title: `${profile.name} — ${profile.title}`,
    description,
    type: "profile",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plex.variable} ${jetbrains.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: documentBootstrap }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only rounded-lg text-sm font-medium focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-overlay) focus:bg-accent focus:px-4 focus:py-3 focus:text-on-accent focus:[--focus-ring:var(--foreground)]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
