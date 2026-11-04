import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { StoreProvider } from "@/components/store/StoreContext";
import { MobileMenuDrawer } from "@/components/layout/MobileMenuDrawer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { SearchModal } from "@/components/layout/SearchModal";

const montserrat = localFont({
  src: "../public/fonts/montserrat-regular.woff2",
  variable: "--font-montserrat",
  display: "swap",
});

const outfit = localFont({
  src: "../public/fonts/outfit-regular.woff2",
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Colors by Nisha Vijay | Designer Lehengas, Sarees & Ethnic Wear",
  description: "Discover Colors by Nisha Vijay. Designer lehengas, sarees and ethnic wear celebrating craftsmanship, creativity and heritage.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${outfit.variable} scroll-smooth scroll-pt-[105px] motion-reduce:scroll-auto lg:scroll-pt-[135px]`}>
      <body className="bg-white font-sans text-sm leading-[1.714] text-ink md:text-[15px] [&_button]:cursor-pointer [&_button]:touch-manipulation [&_a]:touch-manipulation [&_:is(button,a,input):focus-visible]:outline-2 [&_:is(button,a,input):focus-visible]:outline-offset-4 [&_:is(button,a,input):focus-visible]:outline-[#a66c40]">
        <ClerkProvider signInUrl="/login" signUpUrl="/signup" signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
          <StoreProvider>
            {children}
            <MobileMenuDrawer />
            <CartDrawer />
            <SearchModal />
          </StoreProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
