"use server";

import { headers } from "next/headers";
import { clientKey, rateLimit, RequestError } from "@/helpers/security/requests";
import { db } from "@/lib/db";
import { contactUs } from "@/lib/db/schema";

export interface ContactSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitContactAction(formData: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<ContactSubmissionResult> {
  if (!formData || typeof formData !== "object" || ["name", "email", "message"].some(key => typeof formData[key as keyof typeof formData] !== "string") || (formData.phone !== undefined && typeof formData.phone !== "string")) return { success: false, error: "Please check your contact details and try again." };
  const name = formData.name.trim();
  const email = formData.email.trim();
  const phone = formData.phone?.trim() || "";
  const message = formData.message.trim();
  if (name.length > 120 || email.length > 255 || phone.length > 30 || message.length > 5000) return { success: false, error: "Please shorten your message or contact details and try again." };

  if (!name) {
    return { success: false, error: "Please enter your name." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!message) {
    return { success: false, error: "Please enter your message." };
  }

  try {
    rateLimit(`contact:${clientKey(await headers())}`, 5, 5 * 60_000);
    await db.insert(contactUs).values({
      name,
      email,
      phone: phone || null,
      message,
    });

    return {
      success: true,
      message: "Thank you for reaching out! We have received your message and will get back to you shortly.",
    };
  } catch (err) {
    if (err instanceof RequestError) return { success: false, error: err.message };
    console.error("Database error saving contact enquiry:", err);
    return {
      success: false,
      error: "Unable to submit your message right now. Please try again or chat with us on WhatsApp.",
    };
  }
}

