# Email setup

Set server-only environment variables:
- RESEND_API_KEY: Resend sending API key.
- RESEND_FROM_EMAIL: Colors by Nisha <orders@your-verified-domain>.
- NOTIFICATION_EMAIL: store inbox receiving enquiries and paid-order alerts.

Verify the sender domain in Resend before deployment.

Contact enquiries notify the store with the customer as Reply-To. Confirmed payments notify the customer and store. Order status changes notify the customer. Clerk continues sending authentication messages. Newsletter subscriptions remain a preview.

Delivery runs after the response. Failures are logged without reversing saved enquiries or payments. There is no durable retry queue; monitor logs and resend failed notifications operationally. Resend idempotency keys protect duplicate requests for 24 hours. No database changes are required.

Reference: https://resend.com/docs/api-reference/emails/send-email

Templates live in helpers/mail-templates.ts. All existing sends include branded HTML, a preview line, a message-specific subject and heading, and plain text. Order messages include the reference, total and delivery address, with HTTPS tracking links for dispatched orders. Cancellation messages do not promise a completed refund. Authentication templates are managed by Clerk.

Customer payment and order-status emails include a dashboard button. Set SITE_URL to the public HTTPS website origin if different from https://colorsbynisha.com. Dashboard links point to /dashboard; tracking buttons remain available alongside them.

Production environment format (one variable per line, without trailing backslashes):

```dotenv
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=hello@colorsbynisha.com
NOTIFICATION_EMAIL=colorbynishavijay@gmail.com
SITE_URL=https://colorsbynisha.com
```

The sender display name is set to Colors by Nisha by the mail helper. Keep the real API key in local and hosting environment settings; never commit it.
