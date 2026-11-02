"use client";

import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import Link from "next/link";
import { useState } from "react";

export function Footer({ onShop, onPanel }: { onShop?: () => void; onPanel?: (name: string) => void } = {}) {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer id="footer" className="bg-purple text-[13px] text-white">
      <div className="mx-auto grid max-w-[1328px] grid-cols-2 gap-x-5 gap-y-8 px-5 pb-5 pt-9 md:grid-cols-[2fr_1fr_1fr] md:gap-8 md:px-6 md:pb-10 md:pt-12 lg:grid-cols-[2fr_1fr_1fr_1.25fr_2fr]">
        <div className="col-span-2 md:col-span-1">
          <div className="relative h-[125px] w-[100px]">
            <Photo id={2} alt="Colors by Nisha Vijay" contain />
          </div>
          <p className="my-4 max-w-[500px]">We only carry designs we believe in ethically and aesthetically – original, authentic pieces that are made to last.</p>
          <a className="mb-2 block" href="tel:+919799330455">+91 97993 30455</a>
          <a className="mb-2 block" href="mailto:colorbynishavijay@gmail.com">colorbynishavijay@gmail.com</a>
          <a className="mb-2 block" href="https://www.instagram.com/colorsbynisha/" aria-label="Instagram">
            <Icon name="instagram" size={19} />
          </a>
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="mb-4 font-display text-[17px] md:mb-5 md:text-lg">Quick Links</h3>
          <Link href="/">Home</Link>
          {onShop ? <button onClick={onShop}>Shop</button> : <Link href="/shop">Shop</Link>}
          <Link href="/about">About us</Link>
          <Link href="/contact">Contact</Link>
          {onPanel ? <button onClick={() => onPanel("Blogs")}>Blogs</button> : <Link href="/blog">Blogs</Link>}
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="mb-4 font-display text-[17px] md:mb-5 md:text-lg">Categories</h3>
          {["Lehenga", "Saree", "Ethnic"].map(x => onShop ? <button key={x} onClick={onShop}>{x}</button> : <Link key={x} href={`/shop?category=${x.toLowerCase()}`}>{x}</Link>)}
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="mb-4 font-display text-[17px] md:mb-5 md:text-lg">Legal Links</h3>
          {["Privacy Policy", "Terms & Conditions", "Return & Refund", "Customization"].map(x => onPanel ? <button key={x} onClick={() => onPanel(x)}>{x}</button> : <span key={x} className="cursor-pointer hover:underline">{x}</span>)}
        </div>
        <div className="col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-auto">
          <h3 className="mb-4 font-display text-[17px] md:mb-5 md:text-lg">Subscribe to Our Newsletter</h3>
          <p className="mb-5">Subscribe for store updates and discounts.</p>
          <form className="flex border-b border-white/50" onSubmit={event => { event.preventDefault(); setSubscribed(true); }}>
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input className="min-w-0 flex-1 bg-transparent py-3 placeholder:text-white/65" id="newsletter-email" type="email" placeholder="Enter your email..." required />
            <button className="p-2.5 text-2xl" aria-label="Subscribe">→</button>
          </form>
          <p className="mt-2.5 text-[11px]" role="status">{subscribed ? "Thank you! This preview does not send subscriptions." : ""}</p>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1328px] flex-col justify-between gap-1.5 border-t border-white/15 px-5 pt-3.5 pb-24 text-center text-xs md:flex-row md:pb-3.5 md:text-sm">
        <span>© 2026 Colors by Nisha Vijay. All rights reserved.</span>
        <span>Developed by <a href="https://avtechnosys.com" target="_blank" rel="noreferrer">AV Technosys</a>
        </span>
      </div>
    </footer>

  );
}
