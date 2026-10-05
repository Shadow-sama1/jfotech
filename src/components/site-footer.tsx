import Link from "next/link";

export function SiteFooter() {
  return <footer className="bg-ink text-white">
    <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:px-10 lg:py-16">
      <div>
        <Link href="/" className="text-xl font-extrabold tracking-[-0.04em]">JFO <span className="text-primary">TECH</span></Link>
        <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">Powering homes and businesses across Nigeria with dependable solar solutions built to last.</p>
        <p className="mt-5 text-sm text-white/75">Lagos, Nigeria<br />Mon - Sat, 8:00am - 6:00pm</p>
      </div>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.14em]">Explore</h2>
        <ul className="mt-4 space-y-3 text-sm text-white/65"><li><Link href="/shop" className="hover:text-white">Shop all products</Link></li><li><Link href="/services" className="hover:text-white">Installation services</Link></li><li><Link href="/about" className="hover:text-white">About JFO Tech</Link></li><li><Link href="/faq" className="hover:text-white">Help & FAQs</Link></li></ul>
      </div>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.14em]">Customer care</h2>
        <ul className="mt-4 space-y-3 text-sm text-white/65"><li><Link href="/account/orders" className="hover:text-white">Track an order</Link></li><li><Link href="/delivery-and-returns" className="hover:text-white">Delivery & returns</Link></li><li><Link href="/contact" className="hover:text-white">Contact us</Link></li><li><Link href="/privacy" className="hover:text-white">Privacy policy</Link></li></ul>
      </div>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.14em]">Get in touch</h2>
        <p className="mt-4 text-sm text-white/65">Speak with our solar team</p>
        <a href="tel:+2348000000000" className="mt-2 inline-block text-lg font-bold text-white">+234 800 000 0000</a>
        <p className="mt-5 text-sm text-white/65">Secure checkout</p>
        <div className="mt-2 flex gap-2"><span className="border border-white/20 px-3 py-1 text-xs font-bold">PAYSTACK</span><span className="border border-white/20 px-3 py-1 text-xs font-bold">CARD</span><span className="border border-white/20 px-3 py-1 text-xs font-bold">TRANSFER</span></div>
      </div>
    </div>
    <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-white/45 sm:px-8 lg:px-10">© {new Date().getFullYear()} JFO Tech. All rights reserved. · Prices in Nigerian Naira (₦)</div>
  </footer>;
}