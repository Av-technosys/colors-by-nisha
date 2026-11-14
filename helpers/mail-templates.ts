type Detail = [string, string];
type Content = { subject: string; heading: string; intro: string; details: Detail[]; closing: string; actions?: { label: string; url: string }[] };

const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);

function safeUrl(value?: string | null) {
  try { const url = new URL(value || ""); return url.protocol === "https:" ? url.href : undefined; } catch { return undefined; }
}

function render(content: Content) {
  const details = content.details.filter(([, value]) => value);
  const actions = (content.actions ?? []).filter(action => safeUrl(action.url));
  const text = [
    "COLORS BY NISHA", content.heading, content.intro,
    ...details.map(([label, value]) => `${label}: ${value}`),
    ...actions.map(action => `${action.label}: ${action.url}`),
    content.closing, "Colors by Nisha Vijay",
  ].filter(Boolean).join("\n\n");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(content.subject)}</title></head>
<body style="margin:0;padding:0;background:#f6f3ef;color:#302b35;font-family:Arial,Helvetica,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escape(content.intro)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f3ef"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e8e3da">
<tr><td style="padding:28px 24px;background:#2d254d;color:#ffffff;text-align:center;font-family:Georgia,serif;font-size:25px;letter-spacing:2px">COLORS BY NISHA<div style="margin-top:8px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px">BY NISHA VIJAY</div></td></tr>
<tr><td style="padding:32px 24px">
<h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:28px;line-height:1.25;font-weight:normal;color:#2d254d">${escape(content.heading)}</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.7">${escape(content.intro)}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e8e3da;table-layout:fixed">${details.map(([label, value]) => `<tr><td style="padding:14px 0;border-bottom:1px solid #e8e3da;font-size:14px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word"><strong style="display:block;margin-bottom:4px;color:#6c6374;font-size:11px;text-transform:uppercase;letter-spacing:1px">${escape(label)}</strong>${escape(value).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>
${actions.map(action => `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px"><tr><td bgcolor="#2d254d" style="padding:14px 22px"><a href="${escape(action.url)}" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold">${escape(action.label)}</a></td></tr></table>`).join("")}
<p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#6c6374">${escape(content.closing)}</p>
</td></tr><tr><td style="padding:20px 24px;border-top:1px solid #e8e3da;text-align:center;font-size:12px;line-height:1.7;color:#6c6374">Colors by Nisha Vijay<br>Thank you for being part of our story.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject: content.subject, html, text };
}

const statuses = {
  pending: ["Your order is awaiting payment", "Complete your payment from your account to continue with this order."],
  processing: ["Your order is being prepared", "We’re preparing your pieces with care. We’ll let you know when your order is on its way."],
  packed: ["Your order is packed", "Your pieces are packed and ready for dispatch. We’ll send you another update once they have shipped."],
  shipped: ["Your order is on its way", "Your parcel has been dispatched. Your delivery details are below."],
  out_for_delivery: ["Your order is out for delivery", "Your parcel is out for delivery. Please keep your phone available for the courier."],
  delivered: ["Your order has been delivered", "Your parcel has been marked as delivered. We hope you enjoy your new pieces. If you haven’t received it, please contact our team."],
  cancelled: ["Your order has been cancelled", "This order has been cancelled. If you made a payment, contact our team for the refund status. This email does not confirm that a refund has been issued."],
} as const;

type OrderMail = {
  id: string; status: string; totalAmount: string; shippingName: string | null;
  addressLine1: string | null; addressLine2: string | null; city: string | null; state: string | null; pincode: string | null;
  courierName: string | null; trackingNumber: string | null; trackingUrl: string | null;
};

export function orderEmail(order: OrderMail, kind: "payment" | "admin" | "status", issue?: string | null) {
  const reference = `CBN-${order.id.slice(0, 8).toUpperCase()}`;
  const [heading, intro] = kind === "status" ? (statuses[order.status as keyof typeof statuses] ?? ["Your order has been updated", "Please check your account for the latest order details."])
    : kind === "admin" ? [issue ? "Paid order needs your attention" : "A new paid order has arrived", issue || "Payment has been confirmed. Review the order and prepare it for fulfilment."]
    : [issue ? "Payment received — order under review" : "Thank you for your order", issue ? "We’ve received your payment. Our team needs to review your order and will contact you with an update." : "Your payment is confirmed, and we’re preparing your order with care."];
  const tracking = ["shipped", "out_for_delivery", "delivered"].includes(order.status);
  return render({
    subject: `${kind === "payment" && !issue ? "Payment confirmed" : heading} | ${reference} | Colors by Nisha`,
    heading, intro,
    details: [
      ["Order reference", reference], ["Customer", order.shippingName || ""],
      ["Order total", new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(order.totalAmount))],
      ["Delivery address", [order.addressLine1, order.addressLine2, order.city, order.state, order.pincode].filter(Boolean).join(", ")],
      ...(tracking ? [["Courier", order.courierName || ""], ["Tracking number", order.trackingNumber || ""]] as Detail[] : []),
    ],
    actions: [
      ...(kind !== "admin" ? [{ label: "Go to your dashboard", url: new URL("/dashboard", safeUrl(process.env.SITE_URL) || "https://colorsbynisha.com").href }] : []),
      ...(tracking && safeUrl(order.trackingUrl) ? [{ label: "Track your parcel", url: order.trackingUrl! }] : []),
    ],
    closing: kind === "admin" ? "Open the admin dashboard to review the full order and customer details." : "For help with your order, contact our team and quote your order reference.",
  });
}

export function enquiryEmail(input: { name: string; email: string; phone: string; message: string }) {
  return render({
    subject: "New customer enquiry | Colors by Nisha", heading: "A customer would like to hear from you",
    intro: "A new enquiry has been submitted through the website. Reply to this email to contact the customer directly.",
    details: [["Name", input.name], ["Email", input.email], ["Phone", input.phone], ["Message", input.message]],
    closing: "This enquiry has also been saved in the website’s contact records.",
  });
}
