import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Refund | Colors by Nisha Vijay",
  description:
    "Read our return, refund, and cancellation policy at Colors by Nisha Vijay. We follow a strict no return, no refund policy on made-to-order garments.",
};

export default function ReturnAndRefundPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Header/Title Container */}
      <section
        className="w-full pt-8 pb-6 md:pt-10 md:pb-8"
        aria-label="Page Header"
      >
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          <h1 className="font-display text-3xl font-normal leading-tight tracking-normal md:text-4xl text-center text-ink">
            Return & Refund
          </h1>
        </div>
      </section>

      {/* 2. Content Container */}
      <section
        className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] pb-10 md:pb-14"
        aria-label="Policy Content"
      >
        <div className="space-y-6 font-sans text-sm md:text-[15px] font-normal leading-relaxed text-ink">
          {/* Main Policy Heading */}
          <div className="space-y-4">
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug text-black tracking-normal uppercase">
              RETURN, REFUND & CANCELLATION POLICY
            </h2>
            <p>
              At Colors by Nisha Vijay, every outfit is carefully prepared with
              attention to quality and customer preferences. Since our products
              may include customization and are made specifically for each
              customer, we follow a strict No Return, No Refund policy.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              No Return & No Refund
            </h3>
            <p className="mt-1">
              Once an order has been placed and confirmed, it cannot be
              cancelled, returned, exchanged, or refunded. We kindly request
              customers to review all product details, size information, color,
              and customization requirements carefully before placing an order.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Customization
            </h3>
            <p className="mt-1">
              We offer customization services for selected products according to
              the customer&apos;s preferences, such as size adjustments, design
              modifications, or other available customization options.
            </p>
            <p className="mt-3">
              As customized products are specially prepared for individual
              customers, they are not eligible for cancellation, return,
              exchange, or refund under any circumstances.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Damaged or Incorrect Product
            </h3>
            <p className="mt-1">
              If you receive a product that is damaged during transit or an
              incorrect item has been delivered, please contact us within 48
              hours of delivery along with your order number and clear
              photographs of the product and packaging.
            </p>
            <p className="mt-3">
              After verification, we will provide a suitable resolution, which
              may include replacement, repair, or correction of the order at our
              sole discretion.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Order Cancellation
            </h3>
            <p className="mt-1">
              Orders cannot be cancelled once they have been confirmed or
              dispatched, especially for customized products.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Payment Policy
            </h3>
            <p className="mt-1">
              We currently accept prepaid orders only. Cash on Delivery (COD) is
              not available.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Customer Responsibility
            </h3>
            <div className="mt-2 space-y-1">
              <p>
                * Please verify your size, color, shipping address, and
                customization details before placing your order.
              </p>
              <p>
                * Colors may vary slightly due to screen resolution and
                photography.
              </p>
              <p>
                * Minor variations in handcrafted or customized products are a
                natural characteristic and should not be considered defects.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Contact Us
            </h3>
            <p className="mt-1">
              If you have any questions regarding your order or customization,
              please contact our customer support team before placing your
              order. We are happy to assist you in choosing the right product.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
