import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function CustomizationPage() {
  return (
    <div className="min-h-screen bg-white text-ink flex flex-col">
      <Header solid={true} />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink">Customization</h1>
        <p className="mt-4 text-sm text-neutral-600">
          Personalized sizing, bespoke fabric choices, and master tailoring by Colors by Nisha.
        </p>
      </main>
      <Footer />
    </div>
  );
}

