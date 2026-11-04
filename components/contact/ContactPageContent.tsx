"use client";

import React, { useState } from "react";
import Link from "next/link";
import { submitContactAction } from "@/app/(normal)/contact/actions";

export function ContactPageContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    agreedPrivacy: false,
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!formData.message.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your message.");
      return;
    }
    if (!formData.agreedPrivacy) {
      setStatus("error");
      setErrorMessage("Please agree to the Privacy Policy to continue.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await submitContactAction({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(res.error || "Failed to submit enquiry. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again or reach out on WhatsApp.");
    }
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hello Colors by Nisha! I have an enquiry:\n• Name: ${formData.name || "Customer"}\n• Email: ${
        formData.email || "Not specified"
      }\n• Phone: ${formData.phone || "Not specified"}\n• Message: ${formData.message || "General Enquiry"}`
    );
    window.open(`https://wa.me/919799330455?text=${text}`, "_blank");
  };

  return (
    <div className="bg-white text-ink">
      {/* Top Breadcrumb & Page Heading (Identical font size, family & tracking to Shop & Home) */}
      <section className="mx-auto max-w-[1360px] px-4 md:px-6 lg:px-8 pt-6 pb-6 md:pt-10 md:pb-8 text-center">
        {/* Breadcrumb: Home · Contact (text-xs font-medium matching Shop & PDP) */}
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="inline-flex items-center gap-2 text-xs text-neutral-500 font-medium font-sans">
            <li>
              <Link href="/" className="hover:text-ink transition-colors">
                Home
              </Link>
            </li>
            <li className="text-neutral-400 select-none">·</li>
            <li className="text-neutral-700 font-semibold">Contact</li>
          </ol>
        </nav>

        {/* Title: Contact Us (font-display text-3xl md:text-4xl font-normal tracking-wide matching Shop "Products" title) */}
        <h1 className="font-display text-3xl md:text-4xl font-normal tracking-wide text-ink">
          Contact Us
        </h1>
      </section>

      {/* Google Map Section with Interactive Location Card (Matches Screenshot 1) */}
      <section className="mx-auto max-w-[1360px] px-4 md:px-6 lg:px-8 pb-12 md:pb-16">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-neutral-200/90 shadow-sm bg-neutral-100">
          {/* Floating Google Place Card */}
          <div className="relative md:absolute md:top-5 md:left-5 z-10 m-3 md:m-0 max-w-sm rounded-xl bg-white/95 backdrop-blur-md p-4 shadow-xl border border-neutral-100/80">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-semibold text-sm md:text-base text-ink capitalize tracking-tight">
                  colors by nisha
                </h3>
                <p className="mt-1 text-xs text-neutral-600 leading-relaxed font-sans">
                  A 235, Gandhi Path, Queens Rd, Guru Jhambeshwar Nagar A, Vaishali Nagar, Jaipur, Jaipur Nagar Nigam Area, Rajasthan 302021
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="mt-2.5 flex items-center gap-2 text-xs font-sans">
              <span className="font-bold text-ink">4.9</span>
              <div className="flex text-amber-500 text-xs">
                {"★★★★★"}
              </div>
              <span className="text-neutral-500 hover:underline cursor-pointer">(86)</span>
            </div>

            {/* Open in Maps Button */}
            <div className="mt-3.5 pt-3 border-t border-neutral-100">
              <a
                href="https://maps.google.com/?q=colors+by+nisha+jaipur+A+235+Gandhi+Path+Queens+Rd+Vaishali+Nagar"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-[#1a73e8] hover:bg-[#1557b0] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition font-sans"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Open in Maps
              </a>
            </div>
          </div>

          {/* Real Google Maps Iframe */}
          <iframe
            src="https://maps.google.com/maps?q=colors+by+nisha+jaipur+A+235+Gandhi+Path+Queens+Rd+Vaishali+Nagar&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="460"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[360px] md:h-[460px] grayscale-[10%]"
            title="Colors by Nisha Studio Location Map"
          />
        </div>
      </section>

      {/* Two-Column Section: Support Customer & Contact Us Form (Matches Screenshot 2) */}
      <section className="bg-[#eff8f8] py-12 md:py-16 border-t border-neutral-100">
        <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left Column: Support Customer */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-ink">
                  Support Customer
                </h2>
                <p className="mt-2 text-xs md:text-sm text-neutral-600 leading-relaxed font-sans">
                  Have a question? Please contact us using the customer support channels below.
                </p>
              </div>

              {/* Customer Care Box */}
              <div className="rounded-2xl bg-white/80 backdrop-blur-xs p-5 md:p-6 border border-white shadow-2xs space-y-3 font-sans">
                <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Customer Care:
                </h3>

                <div className="space-y-2 text-sm text-neutral-700">
                  <p className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-900">Phone:</span>
                    <a
                      href="tel:+919799330455"
                      className="hover:text-ink hover:underline font-medium transition"
                    >
                      +91 9799330455
                    </a>
                  </p>

                  <p className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-900">Email:</span>
                    <a
                      href="mailto:colorbynishavijay@gmail.com"
                      className="hover:text-ink hover:underline font-medium transition break-all"
                    >
                      colorbynishavijay@gmail.com
                    </a>
                  </p>

                  <p className="flex items-start gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-900">Opening hours:</span>
                    <span className="text-neutral-600">Everyday 11:00am - 7:00pm</span>
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href="https://wa.me/919799330455?text=Hi%20Colors%20by%20Nisha!%20I%20have%20a%20question%20regarding%20customer%20support."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] px-4 py-2 text-xs font-semibold text-white shadow-xs transition"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.79 14.07c-.24.68-1.4 1.25-1.92 1.33-.5.08-1.15.11-3.69-.93-3.08-1.26-5.06-4.39-5.21-4.6-.15-.2-1.25-1.66-1.25-3.17 0-1.51.79-2.25 1.07-2.55.28-.3.61-.38.81-.38.2 0 .41 0 .59.01.19.01.44-.07.69.52.25.6.86 2.08.93 2.23.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.31-.13.62.18.3 1.06 1.75 2.28 2.84 1.57 1.4 2.89 1.83 3.3 2.03.41.2.65.18.89-.1.24-.28 1.03-1.2 1.3-1.61.28-.41.56-.35.94-.2.38.15 2.42 1.14 2.83 1.35.41.2.68.3.78.47.1.17.1.99-.14 1.67z" />
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              {/* Business Enquiry Box */}
              <div className="rounded-2xl bg-white/80 backdrop-blur-xs p-5 md:p-6 border border-white shadow-2xs space-y-2 font-sans">
                <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Business Enquiry:
                </h3>
                <p className="flex items-center gap-2 text-sm text-neutral-700 flex-wrap">
                  <span className="font-semibold text-neutral-900">Email:</span>
                  <a
                    href="mailto:info@colorsbynisha.com"
                    className="hover:text-ink hover:underline font-medium transition"
                  >
                    info@colorsbynisha.com
                  </a>
                </p>
              </div>
            </div>

            {/* Right Column: Contact Us Form */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-ink">
                  Contact Us
                </h2>
                <p className="mt-2 text-xs md:text-sm text-neutral-600 leading-relaxed font-sans">
                  Please submit all general enquiries in the contact form below and we look forward to hearing from you soon.
                </p>
              </div>

              {status === "success" ? (
                <div className="rounded-2xl bg-white p-8 text-center border border-emerald-100 shadow-sm animate-in fade-in duration-300 font-sans">
                  <div className="mx-auto size-14 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink">Thank You!</h3>
                  <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                    We have received your message. Our team will review your enquiry and get back to you shortly.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => {
                        setFormData({ name: "", email: "", phone: "", message: "", agreedPrivacy: false });
                        setStatus("idle");
                      }}
                      className="rounded-md border border-neutral-300 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                    >
                      Send Another Message
                    </button>
                    <button
                      onClick={handleWhatsAppDirect}
                      className="rounded-md bg-[#25D366] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs hover:bg-[#20ba59] transition cursor-pointer"
                    >
                      Continue on WhatsApp
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                  {/* Form inputs: Your name & Your Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Your name *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl md:rounded-2xl border border-neutral-200/90 bg-white px-5 py-3.5 text-sm text-ink placeholder:text-neutral-400 focus:border-[#2d254d] focus:ring-1 focus:ring-[#2d254d] outline-none transition shadow-2xs font-sans"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Your Email *"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl md:rounded-2xl border border-neutral-200/90 bg-white px-5 py-3.5 text-sm text-ink placeholder:text-neutral-400 focus:border-[#2d254d] focus:ring-1 focus:ring-[#2d254d] outline-none transition shadow-2xs font-sans"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2 md:col-span-1">
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl md:rounded-2xl border border-neutral-200/90 bg-white px-5 py-3.5 text-sm text-ink placeholder:text-neutral-400 focus:border-[#2d254d] focus:ring-1 focus:ring-[#2d254d] outline-none transition shadow-2xs font-sans"
                      />
                    </div>
                  </div>

                  {/* Textarea: Enter please your message */}
                  <div>
                    <textarea
                      placeholder="Enter please your message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-2xl border border-neutral-200/90 bg-white px-5 py-4 text-sm text-ink placeholder:text-neutral-400 focus:border-[#2d254d] focus:ring-1 focus:ring-[#2d254d] outline-none transition shadow-2xs resize-none font-sans"
                    />
                  </div>

                  {/* Privacy Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-center gap-3 cursor-pointer text-xs md:text-sm text-neutral-600 select-none font-sans">
                      <input
                        type="checkbox"
                        checked={formData.agreedPrivacy}
                        onChange={(e) => setFormData({ ...formData, agreedPrivacy: e.target.checked })}
                        className="size-4 rounded border-neutral-300 accent-[#2d254d] cursor-pointer"
                      />
                      <span>
                        I agree to the{" "}
                        <Link
                          href="/privacy-policy"
                          className="underline underline-offset-2 font-medium text-ink hover:text-neutral-700"
                        >
                          Privacy Policy
                        </Link>{" "}
                        of the website.
                      </span>
                    </label>
                  </div>

                  {/* Error Message */}
                  {status === "error" && errorMessage && (
                    <p className="text-xs font-medium text-red-600 animate-in fade-in font-sans">
                      {errorMessage}
                    </p>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="rounded-md bg-[#2d254d] hover:bg-[#201938] px-10 py-3.5 font-display text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-xs transition-colors cursor-pointer text-center"
                    >
                      {status === "submitting" ? "SENDING..." : "SEND"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
