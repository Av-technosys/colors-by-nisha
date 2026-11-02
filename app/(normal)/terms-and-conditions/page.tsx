import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Colors by Nisha Vijay",
  description:
    "Review our terms and conditions, return & exchange policy, and customization guidelines at Colors by Nisha Vijay.",
};

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Header/Title Container */}
      <section
        className="w-full py-4 md:py-6 lg:py-7"
        aria-label="Page Header"
      >
        <div className="mx-auto w-full max-w-[1328px] px-5 lg:px-8">
          <h1 className="text-center font-display text-[36px] font-normal tracking-normal leading-[45px] text-ink">
            Terms & Conditions
          </h1>
        </div>
      </section>

      {/* 2. Content Container */}
      <section
        className="mx-auto w-full max-w-[1328px] px-5 pb-16 md:pb-20 lg:px-8"
        aria-label="Policy Content"
      >
        <div className="space-y-6 font-sans text-[15px] font-normal leading-[1.8] text-ink">
          <p>
            By accessing and placing an order through our website, you agree to
            the following terms and conditions:
          </p>

          {/* Numbered List */}
          <ol className="list-decimal pl-6 space-y-6 marker:font-medium marker:text-ink">
            <li className="pl-2">
              <span className="font-sans text-[15px] font-medium leading-[28.8px] text-ink tracking-normal">
                Product Availability
              </span>
              <p className="mt-1">
                All products are subject to availability. We reserve the right
                to discontinue, modify, or update any product, design, price, or
                service without prior notice.
              </p>
            </li>

            <li className="pl-2">
              <span className="font-sans text-[15px] font-medium leading-[28.8px] text-ink tracking-normal">
                Product Representation
              </span>
              <p className="mt-1">
                We strive to display our products as accurately as possible.
                However, slight variations in color, texture, embroidery, print
                placement, or detailing may occur due to photography, lighting
                conditions, screen settings, and the handcrafted nature of
                certain garments.
              </p>
            </li>

            <li className="pl-2">
              <span className="font-sans text-[15px] font-medium leading-[28.8px] text-ink tracking-normal">
                Made-to-Order Production
              </span>
              <p className="mt-1">
                Most of our garments are produced on a made-to-order basis.
                Production begins only after order confirmation and payment
                receipt.
              </p>
            </li>

            <li className="pl-2">
              <span className="font-sans text-[15px] font-medium leading-[28.8px] text-ink tracking-normal">
                Pricing & Payments
              </span>
              <p className="mt-1">
                All prices listed on the website are subject to change without
                prior notice. Orders will be processed only after successful
                payment confirmation.
              </p>
            </li>

            <li className="pl-2">
              <span className="font-sans text-[15px] font-medium leading-[28.8px] text-ink tracking-normal">
                Delivery Timelines
              </span>
              <p className="mt-1">
                Delivery timelines provided are estimates and may vary depending
                on customization requirements, production schedules, shipping
                delays, or unforeseen circumstances. While we make every effort
                to deliver within the stated timeframe, delays may occasionally
                occur.
              </p>
            </li>

            <li className="pl-2">
              <span className="font-sans text-[15px] font-medium leading-[28.8px] text-ink tracking-normal">
                Intellectual Property
              </span>
              <p className="mt-1">
                All content on this website, including designs, images,
                graphics, logos, text, and product concepts, is the exclusive
                property of the brand and may not be copied, reproduced,
                distributed, or used without prior written consent.
              </p>
            </li>

            <li className="pl-2">
              <span className="font-sans text-[15px] font-medium leading-[28.8px] text-ink tracking-normal">
                Order Acceptance
              </span>
              <p className="mt-1">
                We reserve the right to refuse or cancel any order at our
                discretion, including cases involving pricing errors, suspected
                fraudulent activity, or unavailability of materials.
              </p>
            </li>

            <li className="pl-2">
              <span className="font-sans text-[15px] font-medium leading-[28.8px] text-ink tracking-normal">
                Policy Updates
              </span>
              <p className="mt-1">
                The brand reserves the right to update or modify these policies
                at any time without prior notice.
              </p>
            </li>
          </ol>

          {/* Refund, Return & Exchange Policy */}
          <div className="pt-6 space-y-4">
            <h2 className="font-display text-[26px] font-semibold leading-[31.46px] text-black tracking-normal uppercase">
              REFUND, RETURN & EXCHANGE POLICY
            </h2>
            <p>
              As all our garments are made-to-order and crafted specifically for
              each customer after an order is placed, we do not accept returns,
              exchanges, or refunds.
            </p>
            <p>
              Once an order has been confirmed, it cannot be cancelled,
              returned, exchanged, or refunded.
            </p>
            <p>
              In the event of fitting concerns, alteration requirements,
              manufacturing defects, or quality-related issues, customers may
              contact us within 48 hours of receiving their order.
            </p>
            <p>
              Upon review of the concern, we may offer alterations, corrections,
              or reasonable solutions wherever applicable. Any such support will
              be evaluated on a case-by-case basis, and the final decision
              regarding alterations or corrective measures shall remain at the
              sole discretion of the brand.
            </p>
          </div>

          {/* Customization Policy */}
          <div className="pt-6 space-y-4">
            <h2 className="font-display text-[26px] font-semibold leading-[31.46px] text-black tracking-normal uppercase">
              CUSTOMIZATION POLICY
            </h2>
            <p>
              We currently offer customization exclusively on designs available
              within our existing collections.
            </p>
            <p>
              Customers may request modifications to selected garments,
              including adjustments to fit, length, sleeves, neckline details,
              or other feasible design elements, subject to approval by our
              team.
            </p>
            <p>
              All customization requests are evaluated individually and may be
              subject to additional charges and revised delivery timelines.
            </p>
            <p>
              At present, we do not undertake bespoke orders based on external
              reference images, sketches, inspiration photographs, or designs
              from other brands. We only customize garments that are part of our
              own collections and design language.
            </p>
            <p>
              The brand reserves the right to accept or decline any
              customization request based on design feasibility, production
              capabilities, and material availability.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
