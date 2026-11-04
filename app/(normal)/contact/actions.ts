"use server";

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
  const name = formData.name?.trim() || "";
  const email = formData.email?.trim() || "";
  const phone = formData.phone?.trim() || "";
  const message = formData.message?.trim() || "";

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
    console.error("Database error saving contact enquiry:", err);
    return {
      success: false,
      error: "Unable to submit your message right now. Please try again or chat with us on WhatsApp.",
    };
  }
}

