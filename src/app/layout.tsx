import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartSync } from "@/components/cart/cart-sync";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JFO Tech | Solar Power for Every Nigerian Home",
    template: "%s | JFO Tech",
  },
  description:
    "Shop solar panels, inverters, batteries and complete solar installations from JFO Tech. Reliable power, expertly delivered across Nigeria.",
  metadataBase: new URL("https://jfotech.com"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CartDrawer />
        <CartSync />
      </body>
    </html>
  );
}
