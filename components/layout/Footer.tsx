"use client";

import { Form } from "@/components/ui/Form";


import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Container } from "./Container";

export interface FooterProps {
  onShop?: () => void;
  onPanel?: (name: string) => void;
}

export function Footer() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const submitting = useRef(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    submitting.current = true;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to subscribe. Please try again.");
      setMessage(result.message);
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to subscribe. Please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <footer id="footer" className="bg-purple text-[13px] text-white">
      <Container className="grid grid-cols-2 gap-x-5 gap-y-8 py-10 md:grid-cols-[2fr_1fr_1fr] md:gap-8 md:py-14 lg:grid-cols-[2fr_1fr_1fr_1.25fr_2fr]">
        <div className="col-span-2 min-w-0 md:col-span-1">
          <div className="relative h-[125px] w-[100px]">
            <Photo id={2} alt="Colors by Nisha Vijay" contain />
          </div>
          <p className="my-4 max-w-[500px]">
            We only carry designs we believe in ethically and aesthetically –
            original, authentic pieces that are made to last.
          </p>
          <a className="mb-2 block" href="tel:+919799330455">
            +91 97993 30455
          </a>
          <a className="mb-2 block break-words" href="mailto:colorbynishavijay@gmail.com">
            colorbynishavijay@gmail.com
          </a>
          <a
            className="mb-2 block"
            href="https://www.instagram.com/colorsbynisha/"
            aria-label="Instagram"
          >
            <Icon name="instagram" size={19} />
          </a>
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="mb-4 font-display text-[17px] md:mb-5 md:text-lg">
            Quick Links
          </h3>
          <Link href="/" className="hover:underline underline-offset-4 transition-colors">Home</Link>
          <Link href="/shop" className="hover:underline underline-offset-4 transition-colors">Shop</Link>
          <Link href="/about" className="hover:underline underline-offset-4 transition-colors">About us</Link>
          <Link href="/contact" className="hover:underline underline-offset-4 transition-colors">Contact</Link>
          <Link href="/blog" className="hover:underline underline-offset-4 transition-colors">Blogs</Link>
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="mb-4 font-display text-[17px] md:mb-5 md:text-lg">
            Categories
          </h3>
          {[
            { name: "Lehenga", href: "/shop?category=lehenga" },
            { name: "Saree", href: "/shop?category=saree" },
            { name: "Ethnic", href: "/shop?category=ethnic" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:underline underline-offset-4 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="mb-4 font-display text-[17px] md:mb-5 md:text-lg">
            Legal Links
          </h3>
          {[
            { name: "Privacy Policy", href: "/privacy-policy" },
            { name: "Terms & Conditions", href: "/terms-and-conditions" },
            { name: "Return & Refund", href: "/return-and-refund" },
            { name: "Customization", href: "/customization" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:underline underline-offset-4 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="col-span-2 min-w-0 md:col-start-2 lg:col-span-1 lg:col-start-auto">
          <h3 className="mb-4 font-display text-[17px] md:mb-5 md:text-lg">
            Subscribe to Our Newsletter
          </h3>
          <p className="mb-5">Subscribe for store updates and discounts.</p>
          <Form
            className="flex border-b border-white/50"
            onSubmit={subscribe}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              className="min-w-0 flex-1 bg-transparent py-3 placeholder:text-white/65"
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={320}
              disabled={pending}
              placeholder="Enter your email..."
              required
            />
            <button type="submit" disabled={pending} className="p-2.5 text-2xl disabled:opacity-50" aria-label={pending ? "Subscribing" : "Subscribe"}>
              {pending ? "…" : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 12h10m-5-5 5 5-5 5" />
                </svg>
              )}
            </button>
          </Form>
          <p className="mt-2.5 text-[11px]" role="status">
            {message}
          </p>
        </div>
      </Container>
      <Container className="flex flex-col justify-between gap-1.5 border-t border-white/15 pt-3.5 pb-4 text-center text-xs md:flex-row md:pb-3.5 md:text-sm">
        <span>© 2026 Colors by Nisha Vijay. All rights reserved.</span>
        <span>
          Developed by{" "}
          <a href="https://avtechnosys.com" target="_blank" rel="noreferrer">
            AV Technosys
          </a>
        </span>
      </Container>
    </footer>
  );
}
