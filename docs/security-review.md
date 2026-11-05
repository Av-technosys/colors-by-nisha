# Security and order-flow review

Reviewed 5 November 2026. This is a source review with automated regression tests, not a production penetration test or a guarantee that no vulnerabilities exist.

## Changes made

- Added the missing admin check to the product CSV Server Action. Every exported admin mutation now checks the verified Clerk email allowlist itself.
- Added explicit authorization to admin image handlers. Published blog images use a separate public endpoint that excludes drafts.
- Added same-origin and Fetch Metadata checks, JSON content-type checks, streaming byte limits, and bounded request throttling to customer/account/payment writes. Webhooks have separate byte limits and signature validation.
- Replaced raw database, upload-configuration, and authentication-provider errors with safe, actionable messages. Unexpected page failures have branded retry screens; technical details remain server-side.
- Limited the Next image optimizer to known HTTPS hosts, removed the framework identification header, and added content-type, framing, referrer, baseline CSP, permissions, and production HSTS headers.
- Recheck availability before opening payment. Order prices and option labels come from the server catalog, including when a client tampers with prices or labels. A price change refreshes checkout's summary and requires another explicit payment action.
- Require a saved gateway order binding for payment settlement. Confirmed amount, currency, signature, and captured status are checked. Repeated payment callbacks and cancellation do not adjust stock twice.
- Preserve current inventory when an old product form saves unrelated details; reject stale manual stock changes.
- Prevent destructive product/variant changes and CSV replacement for unfinished orders. CSV stock quantities are now respected, with blank stock preserving an existing option’s quantity and remaining untracked only for new options.
- Fixed homepage destinations and cart feedback expiry. The admin overview now uses four database queries for metrics, payment history, stock attention, and recent orders instead of sample figures.

## Access boundaries

| Surface | Protection |
| --- | --- |
| Public catalog and search | Published catalog fields; no account or payment records |
| Public blog images | Valid ID and published-blog filter |
| Cart quotes | Server catalog prices/options, quantity/stock validation, origin/body/burst limits |
| Account and addresses | Clerk session; address ownership; locked user updates; one default address |
| Customer orders and payment status | Clerk session and order ownership; deleted profiles excluded |
| Payment creation and verification | Ownership, saved order amount, gateway binding, signature, provider-captured status |
| Admin pages, actions, image routes, order updates | Verified email allowlist; independent server checks; order revision and status validation |
| Razorpay webhook | HMAC of the bounded original body, saved payment binding, amount/currency/status validation |
| Clerk webhook | SDK signature and timestamp verification before user synchronization |
| Public contact action | Input types/lengths, framework origin checks, burst throttling |

SQL uses parameterized Drizzle queries. Blog HTML is sanitized when saved and when rendered publicly. Uploaded images have size, MIME/signature, ownership-prefix, and signed upload-receipt checks. Admin authorization does not rely on editable profile metadata.

## Verification

- `node tests/checkout-flow.test.mjs`: request-origin/body limits, throttling, safe errors, direct authorization, price/option tampering, order ownership, pre-payment stock checks, payment replay, cancellation, signature validation, checkout loading, recovery, category links, notification expiry, and dashboard daily totals.
- Existing account, authentication, order-validation, and Clerk-webhook tests.
- TypeScript, targeted ESLint, production webpack build, and whitespace checks.
- `npm audit --omit=dev`: zero known production dependency advisories at review time.
- Full `npm audit`: 12 moderate development-tooling advisories, no high or critical advisories. These involve esbuild through Drizzle Kit and minimatch through the ESLint/TypeScript tooling. npm suggests major-version downgrades of framework tooling; no forced downgrade or dependency installation was performed.
- A read-only dashboard query check found an ambiguous column in the stock-count subquery. Explicit aliases corrected it. The final live database recheck was not performed; browser rendering and real gateway transactions remain unverified. No production data was changed by this review.

## Deployment and business limits

1. Throttling is an in-process burst guard. Multi-instance protection requires trusted proxy/IP handling and a shared or platform rate limiter/WAF. Public endpoints also need platform request-size and traffic limits.
2. Stock is deducted only after capture, as requested. Two buyers can pay for the final piece before either callback completes. Transactions prevent negative inventory; an unavailable paid order is flagged for team review. Guaranteed reservation needs a separate business decision.
3. Cancelled paid orders retain payment records. Refunds require payment-provider handling. Dashboard gross collections include captured cancelled orders and are not net revenue after refunds.
4. The CSP added here is a baseline policy, not a strict script allowlist. A stricter policy needs browser validation with Clerk, Razorpay, and the project's cached/streamed Next.js rendering.
5. Production TLS, Clerk production settings/MFA, verified `ADMIN_EMAILS`, webhook secrets/subscriptions, Razorpay capture settings, IAM/S3 permissions, backups, monitoring, and the development-tool advisories still need deployment review. Never deploy `next dev` publicly.

References: [Next.js data security](https://nextjs.org/docs/app/guides/data-security), [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [Razorpay signature verification](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/), [esbuild advisory](https://github.com/advisories/GHSA-67mh-4wv8-2f99), [minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249).
