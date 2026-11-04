This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database

Set `DATABASE_URL` in `.env` using `.env.example` as a reference. For providers
with a pooled connection URL, optionally set `DIRECT_URL` to the direct connection
URL for migrations. Include your provider's required SSL settings in the URL.

Import `db` from `@/lib/db` only in server components, server actions, or route
handlers using the Node.js runtime. The connection uses Drizzle with a shared
`pg` pool during development.

Define tables in `lib/db/schema.ts`, then run:

```bash
npm run db:generate
npm run db:migrate
```

`npm run db:check` validates migration consistency. `npm run db:studio` opens
Drizzle Studio. For local schema iteration, `npm run db:push` applies the schema
directly without generating migrations; review its proposed changes first.

The schema defines categories, products, product variants, product media, blogs, and users.
Blogs use the existing categories table. Generate and review migrations locally,
then apply the reviewed migration with `npm run db:migrate`.

## Admin management

Products, categories, and blogs have database-backed lists and separate `/new`
and `/[id]/edit` pages under `/admin`. Deletion requires confirmation in the UI;
categories referenced by products or blogs cannot be deleted.

The blog editor follows the Shree Goyal Hospital editor: one category, author,
publish date, banner upload (up to 1 MB), SEO fields, draft status, rich text,
tables, links, spacing controls, and a sanitized content preview. New blog and
product images are uploaded to S3; the database stores only their object keys.
Existing database-backed blog banners remain readable.

### Image uploads

Add the following server-side variables to `.env` (see `.env.example`):

```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=avtdev
AWS_S3_PREFIX=public/cbn001
AWS_S3_PUBLIC_URL=https://dg2suxnbcr839.cloudfront.net
```

`AWS_S3_BUCKET` is only the bucket name. `AWS_S3_PREFIX` is the optional folder
prefix; do not include it in the bucket name. The credentials need permission to
put, get, and delete objects below that prefix. Completed uploads are verified
using a server-side signature derived from the configured AWS secret key. `AWS_SESSION_TOKEN` is supported for temporary credentials. The immediate-upload
workflow requires the AWS access key and secret key configured above.
Leave `AWS_S3_PUBLIC_URL` empty for private buckets with signed viewing URLs, or
set it to your public bucket/CDN base URL.

Images upload immediately when selected in the main-product, variant, or blog
form. Each image shows its upload state; failures display a re-upload action. Save
verifies the uploaded files and attaches their S3 keys without uploading again.
Each product image is limited to 5 MB, with up to 20 images per product; blog
banners are limited to 1 MB. Failed saves retain uploads for retry. Explicitly
removed unsaved images are discarded, while removed saved images are cleaned up
after the database change. Closing a tab during upload may leave an unattached
object in S3.

The local `product_media.variant_id` addition requires a migration. Generate,
review, and apply it yourself using `npm run db:generate` and `npm run db:migrate`.

Live database mutation tests must not be run; use mocked database tests instead.

## Customer authentication

Existing login, signup, OTP, and reset screens use Clerk custom flows. Enable
email/password sign-in, email-code signup verification, and the Google SSO connection
in Clerk. Google buttons on login and signup return through `/sso-callback`,
with extra verification or missing signup details handled in the existing forms.
Google accounts use the same database sync and admin allowlist. Mobile is a
contact number collected with signup, not an SMS sign-in method. Full names and
contact mobile numbers are stored in Clerk user metadata and synchronized to the
local `users` table. Passwords and password hashes stay with Clerk;
`password_enabled` is only a boolean status.

Set these variables locally and in Vercel:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
ADMIN_EMAILS=jatinsankhla1@gmail.com
```

`ADMIN_EMAILS` is a comma-separated allowlist of verified Clerk email addresses.
If it is empty, admin access is denied. There is no customer-editable role field.
Admin pages, media endpoints, and mutation actions check authorization server-side.

The webhook endpoint is `/api/webhooks/clerk`. Subscribe to `user.created`,
`user.updated`, and `user.deleted`, and use that endpoint's signing secret.
Webhook updates fetch the current Clerk user, reject stale database updates, and
keep deletion tombstones so delayed events cannot recreate deleted accounts.
The customer dashboard also synchronizes its signed-in profile immediately, so it
does not need to wait for a webhook. Database failures are shown instead of
pretending a profile was saved. The admin users page uses real customer records,
search, and pagination; it does not display sample order or spending totals.

Apply migration `0003_superb_bloodstorm.sql` with `npm run db:migrate` in any other
database used by your deployment before serving customer accounts. Its only
schema change is the `users` table. The configured local database already has it.

Run profile and authorization checks with:

```bash
node tests/auth-profile.test.mjs
node tests/clerk-webhook.test.mjs
node tests/account.test.mjs
```

The account dashboard shows the signed-in customer’s name, email, and mobile.
Missing contact details open a profile-completion dialog after sign-in. Changes
synchronize to the existing user table. Contact numbers are not marked verified
unless they match a verified Clerk phone number.

Saved addresses persist in server-managed Clerk private metadata (up to five
addresses), including edits and a single default address. Marketing preferences
have been removed. No address or consent tables are added. Account mutations
require the current Clerk session and reject cross-origin writes. The all-devices
sign-out action revokes the user’s other active sessions before signing out the
current session.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Products use an unrestricted text short description. Product type, custom
attributes, and editable image descriptions have been removed from the local
schema and admin forms. Review the generated migration before applying these
column removals yourself.
