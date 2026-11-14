import "server-only";

import { after } from "next/server";

type Mail = { to: string; subject: string; text: string; html: string; reply_to?: string };

export function queueMail(key: string, mail: Mail) {
  after(async () => {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      const configuredFrom = process.env.RESEND_FROM_EMAIL?.trim();
      if (!apiKey || !configuredFrom || !mail.to) throw new Error("Missing email configuration");
      const address = configuredFrom.match(/<([^<>]+)>$/)?.[1].trim() || configuredFrom;
      const from = `Colors by Nisha <${address}>`;
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({ from, ...mail }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`Resend returned ${response.status}`);
    } catch (error) {
      console.error("Email delivery failed", key, error instanceof Error ? error.message : "Unknown error");
    }
  });
}

export function notificationEmail() {
  return process.env.NOTIFICATION_EMAIL || "";
}
