import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Colors by Nisha Vijay",
  description:
    "At Colors by Nisha Vijay, we value your privacy and are committed to protecting your personal information. Read our full privacy policy.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Header/Title Container */}
      <section
        className="w-full pt-8 pb-6 md:pt-10 md:pb-8"
        aria-label="Page Header"
      >
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full">
          <h1 className="font-display text-3xl font-normal leading-tight tracking-normal md:text-4xl text-center text-ink">
            Privacy Policy
          </h1>
        </div>
      </section>

      {/* 2. Content Container*/}
      <section
        className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] md:w-full pb-10 md:pb-14"
        aria-label="Policy Content"
      >
        <div className="space-y-6 text-ink text-sm leading-relaxed md:text-[15px]">
          <div>
            <p>Privacy Policy</p>
            <p>Effective Date: August 4, 2026</p>
          </div>

          <p>
            At Colors by Nisha Vijay, we value your privacy and are committed to
            protecting your personal information. This Privacy Policy explains
            what information we collect, how we use it, and the choices you have
            regarding your data.
          </p>

          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug">1. Information We Collect</h2>
            <p className="mt-4">
              When you interact with our website, we may collect:
            </p>
            <div className="mt-3 space-y-1">
              <p>* Full name</p>
              <p>* Email address</p>
              <p>* Mobile number</p>
              <p>* Billing and shipping address</p>
              <p>
                * Payment information (processed securely through trusted
                payment providers)
              </p>
              <p>* Order history</p>
              <p>
                * Device information such as IP address, browser type, and
                cookies
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug">2. How We Use Your Information</h2>
            <p className="mt-4">We use your information to:</p>
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
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug">3. Payment Security</h2>
            <p className="mt-4">
              We do not store your debit or credit card details. All payments
              are securely processed through trusted third-party payment
              gateways.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug">4. Cookies</h2>
            <p className="mt-4">
              Our website uses cookies to improve your browsing experience,
              remember your preferences, and analyze website traffic. You can
              manage or disable cookies through your browser settings.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug">5. Sharing Your Information</h2>
            <p className="mt-4">We never sell your personal information.</p>
            <p className="mt-4">
              Your information may only be shared with trusted service
              providers, such as:
            </p>
            <div className="mt-3 space-y-1">
              <p>* Payment gateway providers</p>
              <p>* Shipping and logistics partners</p>
              <p>* Website hosting and technical support providers</p>
            </div>
            <p className="mt-4">
              These partners receive only the information necessary to provide
              their services.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug">6. Data Security</h2>
            <p className="mt-4">
              We implement appropriate security measures to protect your
              personal information. While no online system is completely secure,
              we take reasonable steps to safeguard your data.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug">7. Your Rights</h2>
            <p className="mt-4">
              Depending on your location, you may request to:
            </p>
            <div className="mt-3 space-y-1">
              <p>* Access your personal information</p>
              <p>* Correct inaccurate information</p>
              <p>* Delete your personal data</p>
              <p>* Opt out of marketing communications</p>
            </div>
            <p className="mt-4">
              To make any request, please contact us using the details below.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug">8. Third-Party Links</h2>
            <p className="mt-4">
              Our website may contain links to external websites. We are not
              responsible for the privacy practices or content of third-party
              websites.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug">9. Changes to This Policy</h2>
            <p className="mt-4">
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page along with the revised effective date.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl md:text-2xl font-medium leading-snug">10. Contact Us</h2>
            <p className="mt-4">
              If you have any questions regarding this Privacy Policy or your
              personal information, please contact us:
            </p>
            <div className="mt-4 space-y-3">
              <p>Colors by Nisha Vijay</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:colorbynishavijay@gmail.com"
                  className="underline underline-offset-4 hover:text-purple transition-colors"
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
      </section>
    </main>
  );
}
