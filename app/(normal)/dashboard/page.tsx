"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoCloseOutline,
  IoLocationOutline,
  IoMailOutline,
  IoPersonCircleOutline,
  IoChevronForwardOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoRefreshOutline,
  IoColorPaletteOutline,
  IoCallOutline,
} from "react-icons/io5";

type PolicyKey = "privacy" | "terms" | "refund" | "customization";

interface PolicyContent {
  title: string;
  effectiveDate?: string;
  content: React.ReactNode;
}

const indianStates = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const worldCountries = [
  { name: "India", dial: "+91", flag: "🇮🇳" },
  { name: "United States", dial: "+1", flag: "🇺🇸" },
  { name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { name: "Canada", dial: "+1", flag: "🇨🇦" },
  { name: "Australia", dial: "+61", flag: "🇦🇺" },
  { name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { name: "Qatar", dial: "+974", flag: "🇶🇦" },
  { name: "Kuwait", dial: "+965", flag: "🇰🇼" },
  { name: "Oman", dial: "+968", flag: "🇴🇲" },
  { name: "Bahrain", dial: "+973", flag: "🇧🇭" },
  { name: "Germany", dial: "+49", flag: "🇩🇪" },
  { name: "France", dial: "+33", flag: "🇫🇷" },
  { name: "Italy", dial: "+39", flag: "🇮🇹" },
  { name: "Spain", dial: "+34", flag: "🇪🇸" },
  { name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { name: "Norway", dial: "+47", flag: "🇳🇴" },
  { name: "Denmark", dial: "+45", flag: "🇩🇰" },
  { name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { name: "Malaysia", dial: "+60", flag: "🇲🇾" },
  { name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { name: "Thailand", dial: "+66", flag: "🇹🇭" },
  { name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { name: "Mauritius", dial: "+230", flag: "🇲🇺" },
  { name: "Afghanistan", dial: "+93", flag: "🇦🇫" },
  { name: "Albania", dial: "+355", flag: "🇦🇱" },
  { name: "Algeria", dial: "+213", flag: "🇩🇿" },
  { name: "Andorra", dial: "+376", flag: "🇦🇩" },
  { name: "Angola", dial: "+244", flag: "🇦🇴" },
  { name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { name: "Armenia", dial: "+374", flag: "🇦🇲" },
  { name: "Austria", dial: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", dial: "+994", flag: "🇦🇿" },
  { name: "Bahamas", dial: "+1", flag: "🇧🇸" },
  { name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
  { name: "Barbados", dial: "+1", flag: "🇧🇧" },
  { name: "Belarus", dial: "+375", flag: "🇧🇾" },
  { name: "Belgium", dial: "+32", flag: "🇧🇪" },
  { name: "Belize", dial: "+501", flag: "🇧🇿" },
  { name: "Benin", dial: "+229", flag: "🇧🇯" },
  { name: "Bhutan", dial: "+975", flag: "🇧🇹" },
  { name: "Bolivia", dial: "+591", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", dial: "+387", flag: "🇧🇦" },
  { name: "Botswana", dial: "+267", flag: "🇧🇼" },
  { name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { name: "Brunei", dial: "+673", flag: "🇧🇳" },
  { name: "Bulgaria", dial: "+359", flag: "🇧🇬" },
  { name: "Cambodia", dial: "+855", flag: "🇰🇭" },
  { name: "Cameroon", dial: "+237", flag: "🇨🇲" },
  { name: "Chile", dial: "+56", flag: "🇨🇱" },
  { name: "China", dial: "+86", flag: "🇨🇳" },
  { name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { name: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { name: "Croatia", dial: "+385", flag: "🇭🇷" },
  { name: "Cyprus", dial: "+357", flag: "🇨🇾" },
  { name: "Czech Republic", dial: "+420", flag: "🇨🇿" },
  { name: "Dominican Republic", dial: "+1", flag: "🇩🇴" },
  { name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { name: "Egypt", dial: "+20", flag: "🇪🇬" },
  { name: "Estonia", dial: "+372", flag: "🇪🇪" },
  { name: "Ethiopia", dial: "+251", flag: "🇪🇹" },
  { name: "Fiji", dial: "+679", flag: "🇫🇯" },
  { name: "Finland", dial: "+358", flag: "🇫🇮" },
  { name: "Georgia", dial: "+995", flag: "🇬🇪" },
  { name: "Ghana", dial: "+233", flag: "🇬🇭" },
  { name: "Greece", dial: "+30", flag: "🇬🇷" },
  { name: "Hong Kong", dial: "+852", flag: "🇭🇰" },
  { name: "Hungary", dial: "+36", flag: "🇭🇺" },
  { name: "Iceland", dial: "+354", flag: "🇮🇸" },
  { name: "Iran", dial: "+98", flag: "🇮🇷" },
  { name: "Iraq", dial: "+964", flag: "🇮🇶" },
  { name: "Israel", dial: "+972", flag: "🇮🇱" },
  { name: "Jamaica", dial: "+1", flag: "🇯🇲" },
  { name: "Japan", dial: "+81", flag: "🇯🇵" },
  { name: "Jordan", dial: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", dial: "+7", flag: "🇰🇿" },
  { name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { name: "Lebanon", dial: "+961", flag: "🇱🇧" },
  { name: "Luxembourg", dial: "+352", flag: "🇱🇺" },
  { name: "Maldives", dial: "+960", flag: "🇲🇻" },
  { name: "Malta", dial: "+356", flag: "🇲🇹" },
  { name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { name: "Morocco", dial: "+212", flag: "🇲🇦" },
  { name: "Nepal", dial: "+977", flag: "🇳🇵" },
  { name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { name: "Panama", dial: "+507", flag: "🇵🇦" },
  { name: "Peru", dial: "+51", flag: "🇵🇪" },
  { name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { name: "Poland", dial: "+48", flag: "🇵🇱" },
  { name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { name: "Romania", dial: "+40", flag: "🇷🇴" },
  { name: "Russia", dial: "+7", flag: "🇷🇺" },
  { name: "Seychelles", dial: "+248", flag: "🇸🇨" },
  { name: "Sri Lanka", dial: "+94", flag: "🇱🇰" },
  { name: "Taiwan", dial: "+886", flag: "🇹🇼" },
  { name: "Tanzania", dial: "+255", flag: "🇹🇿" },
  { name: "Turkey", dial: "+90", flag: "🇹🇷" },
  { name: "Uganda", dial: "+256", flag: "🇺🇬" },
  { name: "Ukraine", dial: "+380", flag: "🇺🇦" },
  { name: "Vietnam", dial: "+84", flag: "🇻🇳" },
  { name: "Zimbabwe", dial: "+263", flag: "🇿🇼" },
];

const policies: Record<PolicyKey, PolicyContent> = {
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
            the customer's preferences, such as size adjustments, design
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
          and other women's ethnic ensembles.
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

export interface AddressItem {
  id: string;
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  isDefault: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);

  // Profile data (initialized blank, auto-synced with logged in/signup user)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Load user info from localStorage (populated on signup/login)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cbn_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.email) {
          const names = (user.fullName || "").trim().split(" ");
          const fName = names[0] || "";
          const lName = names.slice(1).join(" ") || "";
          setProfile((prev) => ({
            ...prev,
            email: user.email,
            firstName: prev.firstName || fName,
            lastName: prev.lastName || lName,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  }, []);

  // Edit Profile Modal state (matching Image 1)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Marketing email consent toggle
  const [marketingEmail, setMarketingEmail] = useState(false);

  // Addresses list & modal state (matching Image 2)
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Add Address Form fields (matching Image 2)
  const [addrCountry, setAddrCountry] = useState("India");
  const [addrPhoneCode, setAddrPhoneCode] = useState("+91");
  const [addrPhoneFlag, setAddrPhoneFlag] = useState("🇮🇳");
  const [addrFirstName, setAddrFirstName] = useState("");
  const [addrLastName, setAddrLastName] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrApartment, setAddrApartment] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("Rajasthan");
  const [addrPinCode, setAddrPinCode] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (activePolicy || showAddressModal || showEditProfileModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activePolicy, showAddressModal, showEditProfileModal]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePolicy(null);
        setShowAddressModal(false);
        setShowEditProfileModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenEditProfile = () => {
    setEditFirstName(profile.firstName);
    setEditLastName(profile.lastName);
    setEditEmail(profile.email);
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = () => {
    const updated = {
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      email: editEmail.trim(),
    };
    setProfile(updated);
    try {
      const stored = localStorage.getItem("cbn_user");
      const user = stored ? JSON.parse(stored) : {};
      localStorage.setItem("cbn_user", JSON.stringify({ ...user, ...updated }));
    } catch (e) {}
    setShowEditProfileModal(false);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem("cbn_user");
      sessionStorage.clear();
    } catch (e) {}
    setProfile({ firstName: "", lastName: "", email: "" });
    setAddresses([]);
    setMarketingEmail(false);
    router.push("/login");
  };

  const handleSaveAddress = () => {
    if (!addrLine.trim() || !addrCity.trim()) return;

    const newAddr: AddressItem = {
      id: Date.now().toString(),
      country: addrCountry,
      firstName: addrFirstName.trim(),
      lastName: addrLastName.trim(),
      address: addrLine.trim(),
      apartment: addrApartment.trim(),
      city: addrCity.trim(),
      state: addrState,
      pinCode: addrPinCode.trim(),
      phone: addrPhone.trim() ? `${addrPhoneCode} ${addrPhone.trim()}` : "",
      isDefault: addrIsDefault || addresses.length === 0,
    };

    setAddresses((prev) => {
      if (newAddr.isDefault) {
        return [...prev.map((a) => ({ ...a, isDefault: false })), newAddr];
      }
      return [...prev, newAddr];
    });

    // Reset address form
    setAddrCountry("India");
    setAddrPhoneCode("+91");
    setAddrPhoneFlag("🇮🇳");
    setAddrFirstName("");
    setAddrLastName("");
    setAddrLine("");
    setAddrApartment("");
    setAddrCity("");
    setAddrState("Rajasthan");
    setAddrPinCode("");
    setAddrPhone("");
    setAddrIsDefault(false);
    setShowAddressModal(false);
  };

  return (
    <main className="min-h-screen bg-[#faf9f6]/80 py-8 md:py-14">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Top Header Row matching Reference Image */}
        <div className="flex items-center justify-between pb-8 md:pb-12 border-b border-neutral-200/70">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#111111]">
              Colorsbynishavijay
            </h1>
            <p className="mt-1 font-sans text-xs md:text-sm text-neutral-500">
              Manage your personal account details and preferences
            </p>
          </div>

          {/* Profile Circle Icon (Matches Reference Image) */}
          <div className="size-11 md:size-12 rounded-full bg-white border border-neutral-200 shadow-2xs flex items-center justify-center text-neutral-700">
            <IoPersonCircleOutline size={32} className="text-neutral-700" />
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 pt-8 md:pt-10">
          {/* Left Column: Legal / Policy Links */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-24 space-y-1.5">
              <p className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 px-3">
                Legal & Policies
              </p>

              <button
                type="button"
                onClick={() => setActivePolicy("privacy")}
                className="w-full flex items-center justify-between text-left px-3.5 py-3 rounded-xl font-sans text-[15px] font-medium text-neutral-700 hover:text-black hover:bg-white hover:shadow-2xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <IoShieldCheckmarkOutline className="text-neutral-400 group-hover:text-[#2d254d] transition-colors" />
                  <span>Privacy Policy</span>
                </div>
                <IoChevronForwardOutline
                  size={14}
                  className="text-neutral-400 group-hover:text-black transition-colors"
                />
              </button>

              <button
                type="button"
                onClick={() => setActivePolicy("terms")}
                className="w-full flex items-center justify-between text-left px-3.5 py-3 rounded-xl font-sans text-[15px] font-medium text-neutral-700 hover:text-black hover:bg-white hover:shadow-2xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <IoDocumentTextOutline className="text-neutral-400 group-hover:text-[#2d254d] transition-colors" />
                  <span>Terms & Conditions</span>
                </div>
                <IoChevronForwardOutline
                  size={14}
                  className="text-neutral-400 group-hover:text-black transition-colors"
                />
              </button>

              <button
                type="button"
                onClick={() => setActivePolicy("refund")}
                className="w-full flex items-center justify-between text-left px-3.5 py-3 rounded-xl font-sans text-[15px] font-medium text-neutral-700 hover:text-black hover:bg-white hover:shadow-2xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <IoRefreshOutline className="text-neutral-400 group-hover:text-[#2d254d] transition-colors" />
                  <span>Return & Refund</span>
                </div>
                <IoChevronForwardOutline
                  size={14}
                  className="text-neutral-400 group-hover:text-black transition-colors"
                />
              </button>

              <button
                type="button"
                onClick={() => setActivePolicy("customization")}
                className="w-full flex items-center justify-between text-left px-3.5 py-3 rounded-xl font-sans text-[15px] font-medium text-neutral-700 hover:text-black hover:bg-white hover:shadow-2xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <IoColorPaletteOutline className="text-neutral-400 group-hover:text-[#2d254d] transition-colors" />
                  <span>Customization</span>
                </div>
                <IoChevronForwardOutline
                  size={14}
                  className="text-neutral-400 group-hover:text-black transition-colors"
                />
              </button>
            </div>
          </aside>

          {/* Right Column: Account Sections */}
          <div className="md:col-span-8 lg:col-span-9 space-y-7 md:space-y-8">
            {/* 1. Contact Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base md:text-lg font-bold text-[#111111]">
                  Contact
                </h2>
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="font-sans text-xs md:text-sm font-semibold text-[#2d254d] hover:text-[#d4af37] px-3.5 py-1.5 rounded-lg border border-neutral-300 hover:border-[#2d254d] bg-white transition-all cursor-pointer shadow-2xs"
                >
                  Edit
                </button>
              </div>

              {/* Pill Card for Contact */}
              <div className="rounded-2xl border border-neutral-200/90 bg-white px-5 py-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-sans text-xs md:text-sm text-neutral-400 font-medium select-none">
                  Email
                </span>
                <div className="text-right sm:text-left">
                  {profile.email ? (
                    <span className="font-sans text-sm md:text-[15px] text-neutral-800 font-normal">
                      {profile.email}
                      {profile.firstName && (
                        <span className="block sm:inline text-xs text-neutral-400 sm:ml-2">
                          ({profile.firstName} {profile.lastName})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="font-sans text-sm text-neutral-400 italic">
                      No email added yet
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Addresses Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base md:text-lg font-bold text-[#111111]">
                  Addresses
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="font-sans text-xs md:text-sm font-semibold text-[#2d254d] hover:text-[#d4af37] px-3.5 py-1.5 rounded-lg border border-neutral-300 hover:border-[#2d254d] bg-white transition-all cursor-pointer shadow-2xs"
                >
                  Add
                </button>
              </div>

              {/* Card for Addresses matching Image */}
              <div className="rounded-2xl border border-neutral-200/90 bg-white px-5 py-4 shadow-2xs">
                {addresses.length === 0 ? (
                  <div className="flex items-center gap-3.5 text-neutral-400 py-1">
                    <div className="size-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                      <IoLocationOutline size={18} />
                    </div>
                    <span className="font-sans text-sm md:text-[15px] text-neutral-500 font-normal">
                      No addresses added
                    </span>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 space-y-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="pt-3 first:pt-0 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-sm font-semibold text-ink">
                              {addr.firstName} {addr.lastName}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2d254d]/10 text-[#2d254d] px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="font-sans text-xs md:text-sm text-neutral-600 leading-relaxed">
                            {addr.address}
                            {addr.apartment ? `, ${addr.apartment}` : ""},{" "}
                            {addr.city}, {addr.state} - {addr.pinCode}
                          </p>
                          {addr.phone && (
                            <p className="font-sans text-xs text-neutral-500 flex items-center gap-1.5 pt-0.5">
                              <IoCallOutline size={13} />
                              <span>+91 {addr.phone}</span>
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setAddresses((prev) =>
                              prev.filter((a) => a.id !== addr.id)
                            )
                          }
                          className="font-sans text-xs text-neutral-400 hover:text-red-600 transition cursor-pointer p-1"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Marketing Preferences Section */}
            <div className="space-y-2.5">
              <h2 className="font-display text-base md:text-lg font-bold text-[#111111]">
                Marketing preferences
              </h2>

              <div className="rounded-2xl border border-neutral-200/90 bg-white px-5 py-4 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="size-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                    <IoMailOutline size={18} />
                  </div>
                  <span className="font-sans text-sm md:text-[15px] text-neutral-800 font-normal">
                    Email
                  </span>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={marketingEmail}
                  onClick={() => setMarketingEmail(!marketingEmail)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    marketingEmail ? "bg-[#2d254d]" : "bg-neutral-300"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      marketingEmail ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs md:text-sm">
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-neutral-300 hover:border-black bg-white px-5 py-2 font-sans font-semibold text-neutral-800 hover:text-black transition-colors shadow-2xs cursor-pointer"
              >
                Sign out
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="font-sans text-neutral-600 hover:text-[#2d254d] underline-offset-4 hover:underline transition-colors cursor-pointer"
              >
                Sign out of all devices
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Edit Profile Modal (Exact Matching Image 1) */}
      {showEditProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Edit profile"
          onClick={() => setShowEditProfileModal(false)}
        >
          <div
            className="relative w-full max-w-[540px] bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 border border-neutral-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-[#111111]">
                Edit profile
              </h2>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="size-8 rounded-full grid place-items-center text-neutral-400 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            {/* Fields matching Image 1 */}
            <div className="space-y-3.5">
              {/* Row 1: First name & Last name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/20 px-3.5 py-3 transition">
                  <input
                    autoFocus
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/20 px-3.5 py-3 transition">
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Row 2: Email input with small label */}
              <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/20 px-3.5 py-2 transition">
                <label className="block text-[11px] font-medium text-neutral-400 leading-tight">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full bg-transparent font-sans text-sm text-ink outline-none mt-0.5 placeholder:text-neutral-300"
                />
              </div>
            </div>

            {/* Bottom buttons matching Image 1 */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="font-sans text-sm font-medium text-[#2d254d] hover:text-[#d4af37] px-3 py-2 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-6 py-2.5 font-sans text-sm font-semibold text-neutral-800 transition cursor-pointer shadow-2xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Address Modal (Exact Matching Image 2) */}
      {showAddressModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Add address"
          onClick={() => setShowAddressModal(false)}
        >
          <div
            className="relative w-full max-w-[580px] bg-white rounded-3xl shadow-2xl p-6 md:p-8 space-y-4 border border-neutral-100 max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-[#111111]">
                Add address
              </h2>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="size-8 rounded-full grid place-items-center text-neutral-400 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            {/* Form Fields matching Image 2 */}
            <div className="space-y-3">
              {/* Country/region */}
              <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] px-3.5 py-2 transition">
                <label className="block text-[11px] font-medium text-neutral-400 leading-tight">
                  Country/region
                </label>
                <select
                  value={addrCountry}
                  onChange={(e) => {
                    const countryName = e.target.value;
                    setAddrCountry(countryName);
                    const found = worldCountries.find((c) => c.name === countryName);
                    if (found) {
                      setAddrPhoneCode(found.dial);
                      setAddrPhoneFlag(found.flag);
                    }
                  }}
                  className="w-full bg-transparent font-sans text-sm text-ink outline-none cursor-pointer mt-0.5"
                >
                  {worldCountries.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* First name & Last name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/20 px-3.5 py-3 transition">
                  <input
                    type="text"
                    value={addrFirstName}
                    onChange={(e) => setAddrFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/20 px-3.5 py-3 transition">
                  <input
                    type="text"
                    value={addrLastName}
                    onChange={(e) => setAddrLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/20 px-3.5 py-3 transition">
                <input
                  type="text"
                  value={addrLine}
                  onChange={(e) => setAddrLine(e.target.value)}
                  placeholder="Address"
                  className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-neutral-400"
                />
              </div>

              {/* Apartment, suite, etc (optional) */}
              <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/20 px-3.5 py-3 transition">
                <input
                  type="text"
                  value={addrApartment}
                  onChange={(e) => setAddrApartment(e.target.value)}
                  placeholder="Apartment, suite, etc (optional)"
                  className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-neutral-400"
                />
              </div>

              {/* City, State, PIN code (3 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/20 px-3.5 py-3 transition">
                  <input
                    type="text"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] px-3.5 py-2 transition">
                  <label className="block text-[11px] font-medium text-neutral-400 leading-tight">
                    State
                  </label>
                  <select
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full bg-transparent font-sans text-sm text-ink outline-none cursor-pointer mt-0.5 truncate"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/20 px-3.5 py-3 transition">
                  <input
                    type="text"
                    value={addrPinCode}
                    onChange={(e) => setAddrPinCode(e.target.value)}
                    placeholder="PIN code"
                    className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Phone with dynamic country code and interactive flag dropdown */}
              <div className="rounded-xl border border-neutral-300 focus-within:border-[#2d254d] px-3.5 py-2 flex items-center justify-between transition">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-neutral-400 leading-tight">
                    Phone
                  </label>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-sans text-sm font-semibold text-neutral-600 shrink-0">
                      {addrPhoneCode}
                    </span>
                    <input
                      type="tel"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      placeholder="Mobile number"
                      className="flex-1 bg-transparent font-sans text-sm text-ink outline-none placeholder:text-neutral-300"
                    />
                  </div>
                </div>

                {/* Country Flag Dropdown with all countries */}
                <div className="relative flex items-center gap-1.5 pl-3 border-l border-neutral-200 text-neutral-700 cursor-pointer hover:bg-neutral-50 rounded-r-lg py-1 px-1 transition">
                  <span className="text-xl select-none">{addrPhoneFlag}</span>
                  <span className="text-[10px] text-neutral-400 select-none">▼</span>
                  <select
                    value={addrCountry}
                    onChange={(e) => {
                      const selected = worldCountries.find(
                        (c) => c.name === e.target.value
                      );
                      if (selected) {
                        setAddrCountry(selected.name);
                        setAddrPhoneCode(selected.dial);
                        setAddrPhoneFlag(selected.flag);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Select country code"
                  >
                    {worldCountries.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name} ({c.dial})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Default address checkbox matching Image 2 */}
              <label className="flex items-center gap-3 cursor-pointer pt-2 select-none">
                <input
                  type="checkbox"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="size-4.5 rounded-full border-neutral-300 text-[#2d254d] accent-[#2d254d] cursor-pointer"
                />
                <span className="font-sans text-xs md:text-sm text-neutral-700">
                  This is my default address
                </span>
              </label>
            </div>

            {/* Bottom buttons matching Image 2 */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="font-sans text-sm font-medium text-[#2d254d] hover:text-[#d4af37] px-3 py-2 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAddress}
                className="rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-6 py-2.5 font-sans text-sm font-semibold text-neutral-800 transition cursor-pointer shadow-2xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Legal Policy Pop-up Modal */}
      {activePolicy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={policies[activePolicy].title}
          onClick={() => setActivePolicy(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 md:px-8 md:py-6 border-b border-neutral-100 bg-white sticky top-0 z-10">
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-[#111111]">
                {policies[activePolicy].title}
              </h2>
              <button
                onClick={() => setActivePolicy(null)}
                className="size-9 rounded-full grid place-items-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <IoCloseOutline size={26} />
              </button>
            </div>

            {/* Scrollable Policy Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8 space-y-4 no-scrollbar">
              {policies[activePolicy].content}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
