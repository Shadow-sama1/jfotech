import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = { title: "Shopping cart" };

export default function CartRoute() {
  return <CartPage />;
}