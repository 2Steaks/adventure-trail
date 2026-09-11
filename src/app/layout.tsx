import type { Metadata, Viewport } from "next";
import { geistSans, geistMono } from "@/src/lib/fonts";
import { QueryProvider } from "@/src/lib/query/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dungeon Master AI",
  description:
    "An AI game master that turns the real world around you into an adventure.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
