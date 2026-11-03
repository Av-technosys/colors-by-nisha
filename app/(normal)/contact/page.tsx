import type { Metadata } from "next";
import { ContactPageContent } from "@/components/contact/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact Us | Colors by Nisha Vijay Studio Jaipur",
  description:
    "Get in touch with Colors by Nisha Vijay. Visit our studio in Vaishali Nagar, Jaipur or reach out for custom couture, bridal appointments, and customer support.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-ink flex flex-col">
      <ContactPageContent />
    </main>
  );
}
