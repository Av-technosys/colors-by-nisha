import type { ReactNode } from "react";

export type PolicyKey = "privacy" | "terms" | "refund" | "customization";

interface PolicyContent { title: string; effectiveDate?: string; content: ReactNode; }

export const policies: Record<PolicyKey, PolicyContent> = {
  privacy: {
    title: "Privacy policy",
    effectiveDate: "August 4, 2026",
    content: (
      <div className="space-y-6 text-ink text-sm leading-[1.8] md:text-[15px]">
        <div>
          <p className="font-medium text-ink">Privacy Policy</p>
          <p className="text-neutral-500">Effective Date: August 4, 2026</p>
        </div>

        <p>
          At Colors by Nisha Vijay, we value your privacy and are committed to
          protecting your personal information. This Privacy Policy explains
          what information we collect, how we use it, and the choices you have
          regarding your data.
        </p>

        <div>
          <h3 className="font-semibold text-ink text-base">
            1. Information We Collect
          </h3>
          <p className="mt-2">
            When you interact with our website, we may collect:
          </p>
          <div className="mt-3 space-y-1">
            <p>* Full name</p>
            <p>* Email address</p>
            <p>* Mobile number</p>
            <p>* Billing and shipping address</p>
            <p>
              * Payment information (processed securely through trusted payment
              providers)
            </p>
            <p>* Order history</p>
            <p>
              * Device information such as IP address, browser type, and
              cookies
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            2. How We Use Your Information
          </h3>
          <p className="mt-2">We use your information to:</p>
          <div className="mt-3 space-y-1">
            <p>* Process and deliver your orders</p>
            <p>* Provide customer support</p>
            <p>* Send order confirmations and shipping updates</p>
            <p>* Improve our website and shopping experience</p>
            <p>
              * Communicate promotional offers (only if you have opted in)
            </p>
            <p>* Prevent fraud and maintain website security</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            3. Payment Security
          </h3>
          <p className="mt-2">
            We do not store your debit or credit card details. All payments
            are securely processed through trusted third-party payment
            gateways.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">4. Cookies</h3>
          <p className="mt-2">
            Our website uses cookies to improve your browsing experience,
            remember your preferences, and analyze website traffic. You can
            manage or disable cookies through your browser settings.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            5. Sharing Your Information
          </h3>
          <p className="mt-2">We never sell your personal information.</p>
          <p className="mt-2">
            Your information may only be shared with trusted service providers,
            such as:
          </p>
          <div className="mt-3 space-y-1">
            <p>* Payment gateway providers</p>
            <p>* Shipping and logistics partners</p>
            <p>* Website hosting and technical support providers</p>
          </div>
          <p className="mt-2">
            These partners receive only the information necessary to provide
            their services.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            6. Data Security
          </h3>
          <p className="mt-2">
            We implement appropriate security measures to protect your
            personal information. While no online system is completely secure,
            we take reasonable steps to safeguard your data.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">7. Your Rights</h3>
          <p className="mt-2">
            Depending on your location, you may request to:
          </p>
          <div className="mt-3 space-y-1">
            <p>* Access your personal information</p>
            <p>* Correct inaccurate information</p>
            <p>* Delete your personal data</p>
            <p>* Opt out of marketing communications</p>
          </div>
          <p className="mt-2">
            To make any request, please contact us using the details below.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            8. Third-Party Links
          </h3>
          <p className="mt-2">
            Our website may contain links to external websites. We are not
            responsible for the privacy practices or content of third-party
            websites.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            9. Changes to This Policy
          </h3>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page along with the revised effective date.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">10. Contact Us</h3>
          <p className="mt-2">
            If you have any questions regarding this Privacy Policy or your
            personal information, please contact us:
          </p>
          <div className="mt-3 space-y-2 text-ink">
            <p className="font-medium">Colors by Nisha Vijay</p>
            <p>
              Email:{" "}
              <a
                href="mailto:colorbynishavijay@gmail.com"
                className="underline underline-offset-4 text-[#2d254d] font-medium transition-colors"
              >
                colorbynishavijay@gmail.com
              </a>
            </p>
            <p>
              Address: A-235, Main Gandhi Path West, Opp. Narayan Ji Gajak,
              Vaishali Nagar, Jaipur, Rajasthan, Indian - 302021
            </p>
          </div>
        </div>
      </div>
    ),
  },
  terms: {
    title: "Terms & Conditions",
    content: (
      <div className="space-y-6 text-ink text-sm leading-[1.8] md:text-[15px]">
        <p>
          By accessing and placing an order through our website, you agree to
          the following terms and conditions:
        </p>

        {/* Numbered List */}
        <ol className="list-decimal pl-6 space-y-6 marker:font-medium marker:text-ink">
          <li className="pl-2">
            <span className="font-semibold text-ink">
              Product Availability
            </span>
            <p className="mt-1">
              All products are subject to availability. We reserve the right
              to discontinue, modify, or update any product, design, price, or
              service without prior notice.
            </p>
          </li>

          <li className="pl-2">
            <span className="font-semibold text-ink">
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
            <span className="font-semibold text-ink">
              Made-to-Order Production
            </span>
            <p className="mt-1">
              Most of our garments are produced on a made-to-order basis.
              Production begins only after order confirmation and payment
              receipt.
            </p>
          </li>

          <li className="pl-2">
            <span className="font-semibold text-ink">
              Pricing & Payments
            </span>
            <p className="mt-1">
              All prices listed on the website are subject to change without
              prior notice. Orders will be processed only after successful
              payment confirmation.
            </p>
          </li>

          <li className="pl-2">
            <span className="font-semibold text-ink">
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
            <span className="font-semibold text-ink">
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
            <span className="font-semibold text-ink">
              Order Acceptance
            </span>
            <p className="mt-1">
              We reserve the right to refuse or cancel any order at our
              discretion, including cases involving pricing errors, suspected
              fraudulent activity, or unavailability of materials.
            </p>
          </li>

          <li className="pl-2">
            <span className="font-semibold text-ink">
              Policy Updates
            </span>
            <p className="mt-1">
              The brand reserves the right to update or modify these policies
              at any time without prior notice.
            </p>
          </li>
        </ol>

        {/* Refund, Return & Exchange Policy */}
        <div className="pt-6 border-t border-neutral-200 space-y-4">
          <h3 className="font-display text-lg font-semibold text-ink uppercase tracking-wide">
            REFUND, RETURN & EXCHANGE POLICY
          </h3>
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
        <div className="pt-6 border-t border-neutral-200 space-y-4">
          <h3 className="font-display text-lg font-semibold text-ink uppercase tracking-wide">
            CUSTOMIZATION POLICY
          </h3>
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
    ),
  },
  refund: {
    title: "Return & Refund",
    content: (
      <div className="space-y-6 text-ink text-sm leading-[1.8] md:text-[15px]">
        {/* Main Policy Heading */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-ink uppercase tracking-wide">
            RETURN, REFUND & CANCELLATION POLICY
          </h3>
          <p>
            At Colors by Nisha Vijay, every outfit is carefully prepared with
            attention to quality and customer preferences. Since our products
            may include customization and are made specifically for each
            customer, we follow a strict No Return, No Refund policy.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-ink text-base">
            No Return & No Refund
          </h4>
          <p className="mt-1">
            Once an order has been placed and confirmed, it cannot be
            cancelled, returned, exchanged, or refunded. We kindly request
            customers to review all product details, size information, color,
            and customization requirements carefully before placing an order.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-ink text-base">
            Customization
          </h4>
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
          <h4 className="font-semibold text-ink text-base">
            Damaged or Incorrect Product
          </h4>
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
          <h4 className="font-semibold text-ink text-base">
            Order Cancellation
          </h4>
          <p className="mt-1">
            Orders cannot be cancelled once they have been confirmed or
            dispatched, especially for customized products.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-ink text-base">
            Payment Policy
          </h4>
          <p className="mt-1">
            We currently accept prepaid orders only. Cash on Delivery (COD) is
            not available.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-ink text-base">
            Customer Responsibility
          </h4>
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
          <h4 className="font-semibold text-ink text-base">
            Contact Us
          </h4>
          <p className="mt-1">
            If you have any questions regarding your order or customization,
            please contact our customer support team before placing your
            order. We are happy to assist you in choosing the right product.
          </p>
        </div>
      </div>
    ),
  },
  customization: {
    title: "Customization",
    content: (
      <div className="space-y-6 text-ink text-sm leading-[1.8] md:text-[15px]">
        <p>
          At Colors by Nisha Vijay, we offer customization services on
          selected garments from our existing collections, including lehengas,
          gowns, one-piece dresses, kurta sets, festive wear, occasion wear,
          and other women&apos;s ethnic ensembles.
        </p>

        <div>
          <p className="font-medium text-ink">
            Customers may request alterations or modifications such as:
          </p>
          <div className="mt-2 space-y-1">
            <p>* Size and fit adjustments</p>
            <p>* Garment length modifications</p>
            <p>* Sleeve length and sleeve style changes</p>
            <p>* Neckline modifications</p>
            <p>* Dupatta customization (where applicable)</p>
            <p>* Minor design adjustments subject to feasibility</p>
            <p>* Custom measurements for a better fit</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            Customization Timeline
          </h3>
          <p className="mt-1">
            Customized garments require additional production time and are
            typically completed within 15 business days from the date of order
            confirmation and successful payment. During festive seasons, sale
            periods, or due to unforeseen production delays, timelines may be
            extended. Customers will be informed of any significant delays
            whenever possible.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            Additional Charges
          </h3>
          <p className="mt-1">
            Certain customization requests may incur additional charges
            depending on the complexity of the modifications requested. Any
            applicable charges will be communicated and approved prior to
            production.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            Custom Measurements
          </h3>
          <p className="mt-1">
            Customers providing custom measurements are responsible for
            ensuring that all measurements submitted are accurate. While every
            effort is made to produce garments according to the measurements
            provided, Colors by Nisha Vijay shall not be responsible for
            fitting issues arising from incorrect measurements submitted by
            the customer.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            No Cancellation, Return or Exchange
          </h3>
          <p className="mt-1">
            As customized garments are created specifically for individual
            customers, all customized orders are final and cannot be
            cancelled, returned, exchanged, or refunded once production has
            commenced.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            Design Restrictions
          </h3>
          <p className="mt-1">
            We currently customize only garments available within our own
            collections. We do not undertake bespoke orders based on external
            reference images, sketches, inspiration photographs, celebrity
            outfits, or designs belonging to other brands or designers.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-ink text-base">
            Right to Refuse Customization
          </h3>
          <p className="mt-1">
            Colors by Nisha Vijay reserves the right to accept, modify, or
            decline any customization request based on design feasibility,
            production capacity, fabric availability, technical limitations,
            or quality standards.
          </p>
        </div>
      </div>
    ),
  },
};

