import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/catalog/product-card";
import { productCardInclude } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function SolarMark() {
  return <svg viewBox="0 0 36 36" className="size-8 text-primary" fill="none" aria-hidden="true"><circle cx="18" cy="18" r="6" fill="currentColor" /><path d="M18 1v6m0 22v6M1 18h6m22 0h6M5.98 5.98l4.24 4.24m15.56 15.56 4.24 4.24m0-24.04-4.24 4.24M10.22 25.78l-4.24 4.24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>;
}

export default async function Home() {
  const [categories, products] = process.env.DATABASE_URL ? await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
      include: { products: { where: { isPublished: true }, orderBy: { popularity: "desc" }, take: 1, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
    }),
    prisma.product.findMany({ where: { isPublished: true }, include: productCardInclude, orderBy: [{ isFeatured: "desc" }, { popularity: "desc" }], take: 4 }),
  ]) : [[], []];
  const catalogUnavailable = !process.env.DATABASE_URL;

  return <>
    <section className="hero-fallback relative isolate min-h-[510px] overflow-hidden bg-ink sm:min-h-[570px] lg:min-h-[630px]">
      <Image src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80" alt="Solar panels catching the afternoon sun" fill priority sizes="100vw" placeholder="blur" blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI5MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgZmlsbD0iIzM2NDI0NSIgd2lkdGg9IjE2MDAiIGhlaWdodD0iOTAwIi8+PC9zdmc+" className="-z-20 object-cover object-center" />
      <div className="hero-grid absolute inset-0 -z-10" />
      <div className="mx-auto flex min-h-[510px] max-w-[1440px] items-center px-5 py-16 sm:min-h-[570px] sm:px-8 lg:min-h-[630px] lg:px-16">
        <div className="reveal-up max-w-[650px] text-white">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.19em] text-white/80"><span className="h-px w-8 bg-primary" />Nigerian energy. A brighter future.</div>
          <h1 className="max-w-[620px] text-[42px] font-extrabold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[72px]">Power your life.<br /><span className="text-primary">Own your energy.</span></h1>
          <p className="mt-6 max-w-[500px] text-base leading-7 text-white/80 sm:text-lg">Reliable solar systems, expertly selected and installed for Nigerian homes and businesses.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/shop" className="inline-flex min-h-12 items-center justify-center bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-hover">Shop solar systems <span className="ml-3" aria-hidden="true">→</span></Link><Link href="/services" className="inline-flex min-h-12 items-center justify-center border border-white/55 px-6 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10">Plan my installation</Link></div>
          <div className="mt-10 flex items-center gap-5 text-xs font-medium text-white/75"><span>✓ Quality-tested products</span><span className="h-1 w-1 rounded-full bg-primary" /><span>Nationwide delivery</span></div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 hidden max-w-[350px] bg-primary px-7 py-5 text-white md:block"><p className="text-[11px] font-bold uppercase tracking-[0.15em]">Power without pause</p><p className="mt-1 text-sm text-white/85">Get expert help building your solar setup.</p></div>
    </section>

    <section className="border-b border-border bg-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
        {[ ["01", "Built for Nigeria", "Products chosen for our climate"], ["02", "Expert installation", "Certified solar professionals"], ["03", "Genuine products", "Manufacturer-backed warranty"], ["04", "Support that stays", "Here before and after install"] ].map(([n, title, copy]) => <div key={title} className="flex gap-3 px-5 py-5 sm:px-6 lg:px-9"><span className="pt-0.5 text-xs font-bold text-primary">{n}</span><div><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted">{copy}</p></div></div>)}
      </div>
    </section>

    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Find your solution</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">Shop by category</h2></div><Link href="/shop" className="shrink-0 text-sm font-semibold text-primary hover:text-primary-hover">Explore all <span aria-hidden="true">→</span></Link></div>
      {catalogUnavailable && <p className="mb-4 border border-primary/20 bg-primary-tint p-3 text-sm text-primary">Configure DATABASE_URL, apply the Prisma migration, and seed the catalog to enable product browsing.</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {categories.map((category) => <Link key={category.slug} href={`/category/${category.slug}`} className="group relative aspect-[0.91] overflow-hidden bg-surface sm:aspect-[1.1]">{category.products[0]?.images[0]?.url && <Image src={category.products[0].images[0].url} alt={category.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 320px" placeholder="blur" blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgZmlsbD0iI2U4ZThlYSIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIi8+PC9zdmc+" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}<div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5"><h3 className="text-base font-bold sm:text-lg">{category.name}</h3><p className="mt-1 text-xs text-white/75">{category.description}</p></div></Link>)}
      </div>
    </section>

    <section className="bg-surface py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Carefully selected</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">Popular right now</h2></div><Link href="/shop?sort=popularity" className="shrink-0 text-sm font-semibold text-primary hover:text-primary-hover">View all <span aria-hidden="true">→</span></Link></div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div className="grid overflow-hidden bg-ink md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[290px] md:min-h-[440px]"><Image src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=85" alt="Solar panels installed on a home rooftop" fill sizes="(max-width: 768px) 100vw, 50vw" placeholder="blur" blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgZmlsbD0iIzM2NDI0NSIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIi8+PC9zdmc+" className="object-cover" /></div>
        <div className="flex flex-col justify-center bg-ink px-6 py-9 text-white sm:px-10 lg:px-14"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">A complete solution</p><h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-4xl">Solar made simple,<br />from start to switch-on.</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/65">The right equipment, correctly sized for your needs, with professional installation and support from one trusted team.</p><ul className="mt-6 grid gap-3 text-sm text-white/85 sm:grid-cols-2"><li>✓ Home energy assessment</li><li>✓ Quality equipment bundle</li><li>✓ Professional installation</li><li>✓ Ongoing maintenance options</li></ul><Link href="/services" className="mt-8 inline-flex min-h-12 w-fit items-center bg-primary px-6 text-sm font-bold hover:bg-primary-hover">Explore solar packages <span className="ml-4" aria-hidden="true">→</span></Link></div>
      </div>
    </section>

    <section className="border-y border-border bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center lg:px-10 lg:py-16">
        <div><div className="mb-4"><SolarMark /></div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Why JFO Tech</p><h2 className="mt-2 max-w-md text-2xl font-extrabold leading-tight tracking-[-0.04em] sm:text-3xl">Good energy is more than just power.</h2><p className="mt-4 max-w-md text-sm leading-6 text-muted">It is peace of mind, a cooler night, a business that keeps moving. We help you make it yours.</p></div>
        <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">{[["01", "Solutions that fit", "Your usage, your space, your budget. No one-size-fits-all guesswork."], ["02", "Genuine equipment", "Every product backed by trusted suppliers and clear warranty support."], ["03", "People who know solar", "Get practical advice from a team that understands local conditions."], ["04", "Here for the long run", "Installation is the start. Our team stays available for what comes next."]].map(([number, title, description]) => <div key={number} className="flex gap-4"><span className="text-xs font-bold text-primary">{number}</span><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1.5 text-xs leading-5 text-muted">{description}</p></div></div>)}</div>
      </div>
    </section>

    <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
      <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Customer stories</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">Powering confidence</h2></div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">{[["The installation was neat and the team explained every part of the system. We finally sleep through the night.", "Adaeze O.", "Homeowner, Lekki"], ["From the first call to handover, JFO made a complicated decision feel straightforward.", "Tunde A.", "Small business owner, Ikeja"], ["Our shop stays open through outages now. The system has paid for itself in peace of mind.", "Chika N.", "Retail owner, Enugu"]].map(([quote, name, role]) => <figure key={name} className="border border-border p-5 sm:p-6"><div className="text-sm tracking-[0.16em] text-primary" aria-label="5 out of 5 stars">★★★★★</div><blockquote className="mt-3 text-sm leading-6 text-ink/80">“{quote}”</blockquote><figcaption className="mt-5 border-t border-border pt-4"><p className="text-sm font-bold">{name}</p><p className="mt-1 text-xs text-muted">{role}</p></figcaption></figure>)}</div>
    </section>

    <section className="bg-primary-tint">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Solar notes, occasionally</p><h2 className="mt-2 text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">Make your next power move a smart one.</h2><p className="mt-2 text-sm text-muted">Updates, practical solar advice, and new arrivals.</p></div><form className="flex w-full max-w-md gap-2" action="#newsletter"><label htmlFor="newsletter-email" className="sr-only">Email address</label><input id="newsletter-email" type="email" placeholder="Your email address" className="h-12 min-w-0 flex-1 border border-border bg-white px-4 text-sm outline-none" required/><button className="shrink-0 bg-primary px-4 text-sm font-bold text-white hover:bg-primary-hover sm:px-6">Subscribe</button></form></div>
    </section>
  </>;
}