import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customization | Colors by Nisha Vijay",
  description:
    "Explore our customization guidelines and services for ethnic wear, lehengas, and gowns at Colors by Nisha Vijay.",
};

export default function CustomizationPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Header/Title Container */}
      <section
        className="w-full pt-8 pb-6 md:pt-10 md:pb-8"
        aria-label="Page Header"
      >
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full">
          <h1 className="font-display text-3xl font-normal leading-tight tracking-normal md:text-4xl text-center text-ink">
            Customization
          </h1>
        </div>
      </section>

      {/* 2. Content Container */}
      <section
        className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full pb-10 md:pb-14"
        aria-label="Customization Content"
      >
        <div className="space-y-6 font-sans text-sm md:text-[15px] font-normal leading-relaxed text-ink">
          <p>
            At Colors by Nisha Vijay, we offer customization services on
            selected garments from our existing collections, including lehengas,
            gowns, one-piece dresses, kurta sets, festive wear, occasion wear,
            and other women&apos;s ethnic ensembles.
          </p>

          <div>
            <p className="font-normal text-ink">
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
            <h2 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Customization Timeline
            </h2>
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
            <h2 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Additional Charges
            </h2>
            <p className="mt-1">
              Certain customization requests may incur additional charges
              depending on the complexity of the modifications requested. Any
              applicable charges will be communicated and approved prior to
              production.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Custom Measurements
            </h2>
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
            <h2 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              No Cancellation, Return or Exchange
            </h2>
            <p className="mt-1">
              As customized garments are created specifically for individual
              customers, all customized orders are final and cannot be
              cancelled, returned, exchanged, or refunded once production has
              commenced.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Design Restrictions
            </h2>
            <p className="mt-1">
              We currently customize only garments available within our own
              collections. We do not undertake bespoke orders based on external
              reference images, sketches, inspiration photographs, celebrity
              outfits, or designs belonging to other brands or designers.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg md:text-xl font-medium leading-snug text-ink tracking-normal">
              Right to Refuse Customization
            </h2>
            <p className="mt-1">
              Colors by Nisha Vijay reserves the right to accept, modify, or
              decline any customization request based on design feasibility,
              production capacity, fabric availability, technical limitations,
              or quality standards.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
