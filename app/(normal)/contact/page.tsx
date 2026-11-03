import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactPageContent } from "@/components/contact/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact Us | Colors by Nisha Vijay Studio Jaipur",
  description:
    "Get in touch with Colors by Nisha Vijay. Visit our studio in Vaishali Nagar, Jaipur or reach out for custom couture, bridal appointments, and customer support.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-ink flex flex-col">
      <Header solid={true} activeNav="contact" />
      <main className="flex-1">
        <ContactPageContent />
      </main>
      <Footer />
    </div>
  );
}
