"use client";

import React, { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR, getAllProducts, type ProductItem } from "@/data/products";
import { useStore } from "@/components/store/StoreContext";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { IoEyeOutline } from "react-icons/io5";

const noopSubscribe = () => () => {};

interface CartPageContentProps {
  initialCrossSellProducts?: ProductItem[];
}

export function CartPageContent({ initialCrossSellProducts }: CartPageContentProps = {}) {
  const isMounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const { cart, updateQuantity, removeFromCart, addToCart } = useStore();
  const [selectedQuickProduct, setSelectedQuickProduct] = useState<ProductItem | null>(null);
  const [orderNote, setOrderNote] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // Shipping Calculator state
  const [country, setCountry] = useState("India");
  const [province, setProvince] = useState("Rajasthan");
  const [zipCode, setZipCode] = useState("");
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [crossSellIndex, setCrossSellIndex] = useState(0);

  // Cross sell products (uses dynamic products from database when available, fallback to catalog)
  const allProducts = initialCrossSellProducts && initialCrossSellProducts.length > 0
    ? initialCrossSellProducts
    : getAllProducts();
  const crossSellProducts = allProducts.filter((p) => !cart.some((c) => c.slug === p.slug)).slice(0, 6);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 10000;
  const isFreeShipping = subtotal >= freeShippingThreshold || cart.length === 0;

  const handleCheckout = () => {
    if (!agreedTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);

    // Prepare WhatsApp checkout order text
    const text = encodeURIComponent(
      `Hello Colors by Nisha! I would like to checkout my Cart:\n${cart
        .map((i) => `• ${i.name} (Qty: ${i.quantity}) - ${formatINR(i.price * i.quantity)}`)
        .join("\n")}\n\n• Subtotal: ${formatINR(subtotal)}\n• Country/Province: ${country}, ${province} (${zipCode || "N/A"})\n• Note: ${
        orderNote || "None"
      }`
    );
    window.open(`https://wa.me/919799330455?text=${text}`, "_blank");
  };

  const handleEstimateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingCalculated(true);
  };

  return (
    <div className="bg-white text-ink pb-24">
      {/* 1. Breadcrumb & Page Heading (Matches Screenshot) */}
      <section className="mx-auto max-w-[1360px] px-4 md:px-6 lg:px-8 pt-6 pb-4 md:pt-10 md:pb-6 text-center">
        {/* Breadcrumb: Home · Your Shopping Cart */}
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="inline-flex items-center gap-2 text-xs text-neutral-500 font-medium font-sans">
            <li>
              <Link href="/" className="hover:text-ink transition-colors">
                Home
              </Link>
            </li>
            <li className="text-neutral-400 select-none">·</li>
            <li className="text-neutral-700 font-semibold">Your Shopping Cart</li>
          </ol>
        </nav>

        {/* Title: Shopping Cart */}
        <h1 className="font-display text-3xl md:text-4xl font-normal tracking-wide text-ink">
          Shopping Cart
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-xs md:text-sm text-neutral-500 font-sans max-w-lg mx-auto">
          Review your selected items before purchase. Enjoy a seamless shopping experience!
        </p>
      </section>

      {/* Main 2-Column Content Layout */}
      <div className="mx-auto max-w-[1360px] px-4 md:px-6 lg:px-8">
        {!isMounted ? (
          /* Initial loading placeholder matching server & client to prevent hydration mismatch */
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="inline-block size-7 rounded-full border-2 border-neutral-200 border-t-[#2d254d] animate-spin mb-3" />
            <p className="text-xs font-medium text-neutral-400 font-sans tracking-wide">
              Loading your cart...
            </p>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart View */
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="mx-auto size-20 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">Your cart is empty</h2>
            <p className="mt-2 text-sm text-neutral-500 font-sans">
              Discover our handcrafted festive & bridal collections and find your dream ensemble.
            </p>
            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-block rounded-md bg-[#2d254d] px-8 py-3.5 font-display text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#201938] transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Cart Table, Trust Badges, You may also like */}
            <div className="lg:col-span-8 space-y-10">
              {/* Cart Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-700">
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 text-center font-semibold">Price</th>
                      <th className="pb-3 text-center font-semibold">Quantity</th>
                      <th className="pb-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {cart.map((item, index) => {
                      const itemImage = item.image || "/Home/images/015_kesari_rang__IMG_0124.jpg";
                      return (
                      <tr key={`${item.slug}-${index}`} className="align-middle">
                        {/* Product Column */}
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-4">
                            <div className="relative aspect-2/3 w-16 md:w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100 border border-neutral-100">
                              <Image
                                src={itemImage}
                                unoptimized={typeof itemImage === "string" && (itemImage.startsWith("http") || itemImage.startsWith("data:"))}
                                alt={item.name}
                                fill
                                sizes="80px"
                                className="object-cover object-top"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/products/${item.slug}`}
                                className="font-display text-xs md:text-sm font-bold uppercase text-ink hover:underline tracking-tight block"
                              >
                                {item.name}
                              </Link>
                              {item.size && item.size !== "Standard" && (
                                <p className="text-[11px] text-neutral-500 mt-0.5">
                                  {["XS", "S", "M", "L", "XL", "XXL", "Custom"].includes(item.size) ? `Size: ${item.size}` : `Option: ${item.size}`}
                                </p>
                              )}
                              <button
                                onClick={() => removeFromCart(index)}
                                className="mt-2 text-xs text-neutral-400 hover:text-red-600 underline underline-offset-2 transition cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Price Column */}
                        <td className="py-5 px-3 text-center font-display text-xs md:text-sm font-semibold text-neutral-800 whitespace-nowrap">
                          {formatINR(item.price)}
                        </td>

                        {/* Quantity Pill Column */}
                        <td className="py-5 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-between rounded-full bg-[#f4f4f4] px-3.5 py-1.5 w-[105px]">
                            <button
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="text-base text-neutral-600 hover:text-ink font-medium px-1 cursor-pointer select-none"
                              aria-label="Decrease quantity"
                            >
                              —
                            </button>
                            <span className="text-xs font-semibold text-ink select-none">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="text-base text-neutral-600 hover:text-ink font-medium px-1 cursor-pointer select-none"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Total Column */}
                        <td className="py-5 pl-4 text-right font-display text-xs md:text-sm font-bold text-ink whitespace-nowrap">
                          {formatINR(item.price * item.quantity)}
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Trust Badges (Matches Screenshot 3 boxes: Have Questions?, Secure Shopping, Privacy Protection) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* 1. Have Questions */}
                <div className="rounded-xl bg-[#f9fafb] p-4 text-center border border-neutral-100 flex flex-col items-center">
                  <div className="mb-2 size-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-neutral-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </div>
                  <h4 className="font-display font-bold text-xs text-ink uppercase tracking-tight">Have Questions?</h4>
                  <p className="mt-1 text-[11px] text-neutral-500 font-sans leading-tight">
                    Our experts are here to help! Call us free.
                  </p>
                </div>

                {/* 2. Secure Shopping */}
                <div className="rounded-xl bg-[#f9fafb] p-4 text-center border border-neutral-100 flex flex-col items-center">
                  <div className="mb-2 size-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-neutral-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h4 className="font-display font-bold text-xs text-ink uppercase tracking-tight">Secure Shopping</h4>
                  <p className="mt-1 text-[11px] text-neutral-500 font-sans leading-tight">
                    All transactions are protected by SSL technology.
                  </p>
                </div>

                {/* 3. Privacy Protection */}
                <div className="rounded-xl bg-[#f9fafb] p-4 text-center border border-neutral-100 flex flex-col items-center">
                  <div className="mb-2 size-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-neutral-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="font-display font-bold text-xs text-ink uppercase tracking-tight">Privacy Protection</h4>
                  <p className="mt-1 text-[11px] text-neutral-500 font-sans leading-tight">
                    Your privacy is always our top priority.
                  </p>
                </div>
              </div>

              {/* You may also like... Cross-Sell Box (Matches Screenshot) */}
              {crossSellProducts.length > 0 && (
                <div className="pt-2">
                  <h3 className="font-display font-bold text-sm md:text-base text-ink mb-3">
                    You may also like...
                  </h3>

                  <div className="rounded-xl border border-neutral-200/80 p-4 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {crossSellProducts
                        .slice(crossSellIndex * 2, crossSellIndex * 2 + 2)
                        .map((product) => {
                          const productImage = product.images?.[0] || "/Home/images/015_kesari_rang__IMG_0124.jpg";
                          return (
                          <div
                            key={product.id}
                            className="flex items-center gap-3.5 p-2 rounded-lg hover:bg-neutral-50 transition"
                          >
                            <Link
                              href={`/products/${product.slug}`}
                              className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded bg-neutral-100"
                            >
                              <Image
                                src={productImage}
                                unoptimized={typeof productImage === "string" && (productImage.startsWith("http") || productImage.startsWith("data:"))}
                                alt={product.name}
                                fill
                                sizes="64px"
                                className="object-cover object-top"
                              />
                            </Link>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/products/${product.slug}`}
                                className="font-display font-bold text-xs text-ink uppercase truncate block hover:underline"
                              >
                                {product.name}
                              </Link>
                              <p className="font-display text-xs font-semibold text-neutral-700 mt-0.5">
                                {formatINR(product.price)}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={() => addToCart(product, "M", 1)}
                                  className="rounded bg-[#2d254d] hover:bg-[#201938] px-3.5 py-1.5 font-display text-[10px] font-bold uppercase tracking-wider text-white shadow-2xs transition cursor-pointer"
                                >
                                  ADD TO CART
                                </button>
                                <button
                                  onClick={() => setSelectedQuickProduct(product)}
                                  className="size-7 grid place-items-center rounded bg-neutral-100 hover:bg-neutral-200 text-ink transition cursor-pointer"
                                  aria-label={`Quick view ${product.name}`}
                                  title="Quick view"
                                >
                                  <IoEyeOutline size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                        })}
                    </div>

                    {/* Pagination Dots */}
                    {crossSellProducts.length > 2 && (
                      <div className="flex justify-center items-center gap-1.5 pt-4">
                        {[0, 1, 2].map((dot) => (
                          <button
                            key={dot}
                            onClick={() => setCrossSellIndex(dot)}
                            className={`size-1.5 rounded-full transition-all cursor-pointer ${
                              crossSellIndex === dot ? "bg-ink w-3" : "bg-neutral-300"
                            }`}
                            aria-label={`Go to slide ${dot + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary Card (Matches Screenshot) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl bg-[#f9fafb] p-5 md:p-6 border border-neutral-200/70 shadow-2xs space-y-5 font-sans">
                {/* Free Shipping Progress Indicator */}
                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-neutral-700 mb-1.5">
                    <span>
                      {isFreeShipping ? (
                        <strong className="text-emerald-700 font-semibold">
                          Congratulations! You&apos;ve got free shipping!
                        </strong>
                      ) : (
                        <span>
                          Add <strong>{formatINR(freeShippingThreshold - subtotal)}</strong> more for Free Shipping!
                        </span>
                      )}
                    </span>
                    <span className="text-emerald-600">🚚</span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{
                        width: isFreeShipping ? "100%" : `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Add Order Note */}
                <div className="pt-2 border-t border-neutral-200/60">
                  <label htmlFor="order-note" className="block text-xs font-semibold text-neutral-800 mb-2">
                    Add Order Note
                  </label>
                  <textarea
                    id="order-note"
                    placeholder="Add Order Note"
                    rows={3}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-ink placeholder:text-neutral-400 focus:border-[#2d254d] focus:ring-1 focus:ring-[#2d254d] outline-none transition resize-none shadow-2xs"
                  />
                </div>

                {/* Estimate Shipping Form */}
                <div className="pt-2 border-t border-neutral-200/60">
                  <h4 className="text-xs font-semibold text-neutral-800 mb-2.5">
                    Estimate Shipping
                  </h4>
                  <form onSubmit={handleEstimateShipping} className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1">Country/region</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-ink focus:border-[#2d254d] outline-none"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1">Province</label>
                      <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-ink focus:border-[#2d254d] outline-none"
                      >
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Punjab">Punjab</option>
                        <option value="West Bengal">West Bengal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-500 block mb-1">Postal/ZIP code</label>
                      <input
                        type="text"
                        placeholder="Postal/ZIP code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-ink placeholder:text-neutral-400 focus:border-[#2d254d] outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-md bg-[#2d254d] hover:bg-[#201938] py-2.5 px-4 font-display text-xs font-bold uppercase tracking-wider text-white shadow-2xs transition cursor-pointer"
                    >
                      ESTIMATE SHIPPING
                    </button>
                  </form>

                  {shippingCalculated && (
                    <div className="mt-3 rounded-lg bg-emerald-50/80 p-2.5 text-center text-xs text-emerald-800 font-medium">
                      ✓ Free Express Insured Shipping to {country} ({province})
                    </div>
                  )}
                </div>

                {/* Subtotal, Terms, Checkout Button */}
                <div className="pt-4 border-t border-neutral-200/80 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display font-semibold text-sm text-neutral-800">Subtotal:</span>
                    <span className="font-display font-bold text-base md:text-lg text-ink">
                      {formatINR(subtotal)} INR
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    Tax included and shipping calculated at checkout
                  </p>

                  {/* Terms Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => {
                          setAgreedTerms(e.target.checked);
                          if (e.target.checked) setTermsError(false);
                        }}
                        className="size-4 rounded border-neutral-300 accent-[#2d254d] cursor-pointer"
                      />
                      <span>
                        I agree with <strong className="font-semibold text-ink">Terms & Conditions</strong>
                      </span>
                    </label>
                    {termsError && (
                      <p className="text-xs text-red-600 font-medium mt-1">Please accept the Terms & Conditions.</p>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-md bg-[#64597b] hover:bg-[#524867] py-3.5 px-6 font-display text-xs md:text-sm font-bold uppercase tracking-wider text-white shadow-xs transition-colors cursor-pointer text-center"
                  >
                    CHECK OUT
                  </button>
                </div>
              </div>

              {/* Delivery Information & Up to 10-Day Guarantee (Matches Screenshot) */}
              <div className="rounded-xl bg-white p-5 border border-neutral-100 shadow-2xs space-y-3 font-sans text-xs">
                <div>
                  <h5 className="font-display font-bold text-xs text-ink uppercase tracking-tight">
                    Delivery Information
                  </h5>
                  <p className="mt-1 text-neutral-500 leading-relaxed">
                    Customised orders will be delivered within 15 days.
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <h5 className="font-display font-bold text-xs text-ink uppercase tracking-tight">
                    Up to 10-Day Guarantee
                  </h5>
                  <p className="mt-1 text-neutral-500 leading-relaxed">
                    Bad luck with your tights? Simply contact us within 10 days of receiving your order and we will customised them for free!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedQuickProduct && (
        <QuickViewModal
          product={selectedQuickProduct}
          onClose={() => setSelectedQuickProduct(null)}
        />
      )}
    </div>
  );
}
