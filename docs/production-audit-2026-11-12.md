# Production audit — Colors by Nisha

Date: 12 November 2026 · Checkout: `cca7856` · Workspace: `/home/jatin/Code/Office/colors-by-nisha`

**Recommendation: do not release this checkout yet.** The audit identifies **41 source/build findings: 9 P1, 29 P2 and 3 P3**, plus **5 visual review candidates** and **10 deployment/business limitations**. Counts describe findings, not a count of exploitable security vulnerabilities.

P1 means resolve or explicitly gate the affected feature before release. P2 means a meaningful correctness, accessibility, reliability or production-quality issue. P3 means lower-impact polish. Some items are conditional on deployment path or input; those conditions are stated.

The original audit was read-only. A follow-up pass made UI-only fixes in the files listed in the current workspace diff; it did not change API routes, database schemas, business rules, uploads, real orders/payments or deployments. The review traced callers, route handlers, authorization, persistence and storage rather than treating filenames as evidence of working features.

## Scope and verification

Inventory: **204 TS/TSX/CSS source files**, **39 page files**, **15 API route handlers**, **7 SQL migrations**, **5 test files** and **138 public assets** (approximately 240 MB on disk). Total asset size is not the size downloaded by a page. Dependencies include Next 16.4.3, React 19.3.0 and Clerk 7.9.x. The installed Next production checklist and error-boundary documentation were consulted.

| Check | Result | What it establishes |
| --- | --- | --- |
| `npm run lint` | Passed | Configured static lint rules. |
| `npx tsc --noEmit --incremental false` | Passed | Current TypeScript compatibility. |
| `node --test tests/*.test.mjs` | All five files passed | Existing unit/mocked/source regressions; not live integration tests. The shop-page VM fixture now stubs its new modal hook/ref. |
| `npm run db:check` | Passed | Drizzle migration metadata check; **does not establish SQL/schema parity**. |
| SQL/schema/snapshot comparison | Failed parity | Missing payment/contact tables and short-description type migration (F01–F02). |
| Isolated CSV execution with mocked database | Defects reproduced | Archived→active, negative price→positive, collapsed option combinations, unsupported specification generation and variant replacement. No real database used. |
| Latest `npm run build` | Passed | Production compilation, TypeScript, and static page generation completed. Next warned that `metadataBase` is missing and defaults to localhost. |
| Earlier `npm run build` | Environment-blocked | Turbopack worker port binding failed with Operation not permitted; the latest successful run supersedes that attempt. |
| `npm run build -- --webpack` | Process completed; CSS failed inspection | Tailwind utilities were not generated (F08). **Not a usable production build sign-off.** |
| Direct Tailwind compilation before UI fix | Ordinary utilities generated; animation classes absent | F35 was subsequently addressed with local enter-animation utilities and reduced-motion styling. |
| Local asset/font references | No missing literal referenced files found | Does not prove remote image availability or dynamically constructed paths. |
| Font inspection | Both variable faces provide weight axis 100–900 | F25 fixed with self-hosted Montserrat and Outfit variable fonts. |
| Current npm vulnerability scan | Blocked by DNS/network and failed escalation review | No current advisory clearance. The earlier November 5 security note is historical, not a fresh result. |
| Live database | Blocked by EAI_AGAIN | Existing schema, data integrity, indexes under load and restore readiness unverified. |
| Browser/viewport/accessibility testing | Not performed | Local server failed EPERM; user confirmed no staging URL. No screenshot or pixel-perfect sign-off. |

### UI follow-up status

The UI fixes are source-level and are not represented as browser-verified. Findings F25–F35 below have been addressed in source, with qualifications noted where verification remains. Customer-facing functional small-text contrast was improved for the reviewed cart, shop, checkout, product, order and account details, but decorative/admin neutral-400 uses remain and need context-sensitive review.

Latest follow-up checks: `npm run lint` passed; `npm run build` passed with a `metadataBase` warning; `npx tsc --noEmit --incremental false` passed after the build regenerated `.next/types`; `node --test tests/*.test.mjs` passed all five files after updating the shop-page VM fixture to stub the new modal hook/ref; `git diff --check` passed. No browser or staging review was possible.

Local-server and network escalation attempts encountered an **automatic approval-review service error: HTTP 403, “model is not allowed for this key.”** This was an approval-service failure, not evidence that the requested read-only audit was unsafe. The checks remained blocked; no bypass was used.

## Confirmed findings

The nine P1 items are F01–F08 and F17. Start with schema/migrations, unsafe CSV imports and production sample fallbacks. F08 applies specifically to the webpack fallback build; the default build still requires verification. Shipping needs an agreed business rule before its UI and server calculation can be aligned.

### F01 · P1 · Database migrations do not create two tables used in production

The checked-in SQL migrations never create `payment` or `contact_us`, although both are defined in [lib/db/schema.ts](</home/jatin/Code/Office/colors-by-nisha/lib/db/schema.ts:177>) and [lib/db/schema.ts](</home/jatin/Code/Office/colors-by-nisha/lib/db/schema.ts:260>) and used by payment creation, webhooks, the dashboard and the contact form. A fresh database built only with these migrations cannot support those flows. The latest migration snapshot includes `contact_us`, so snapshot validation alone conceals part of the drift. Existing hosted database state was not reachable.

**Next step:** Repair migration history through a new, reviewed migration, and prove a clean database can migrate and exercise checkout/contact. Compare the existing database before applying changes.

### F02 · P1 · Short descriptions remain varchar(100) in a migration-built database

[drizzle/0000_large_doomsday.sql](</home/jatin/Code/Office/colors-by-nisha/drizzle/0000_large_doomsday.sql:34>) creates `product_type varchar(100)`; [drizzle/0002_closed_morlocks.sql](</home/jatin/Code/Office/colors-by-nisha/drizzle/0002_closed_morlocks.sql:1>) only renames it. [lib/db/schema.ts](</home/jatin/Code/Office/colors-by-nisha/lib/db/schema.ts:35>) and the latest snapshot describe `text`, but no SQL changes the type. The CSV importer generates descriptions far longer than 100 characters. Saving/importing these into a database created from SQL will fail.

**Next step:** Add the missing type migration and test a long description against a clean migrated database.

### F03 · P1 · CSV import publishes archived and out-of-stock products

[app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:552>) reads status, but [app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:587>) maps only `false` and `draft` to draft; every other value becomes active and overwrites the existing status. An isolated execution of the real importer with mocked storage converted `archived` to `active`. Blank status also activates an existing product.

**Next step:** Validate explicit status values and preserve an existing status when the CSV omits it.

### F04 · P1 · CSV import deletes variant identities and their images

[app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:720>) deletes every existing variant and recreates it. The variant-to-media foreign key uses ON DELETE CASCADE ([lib/db/schema.ts](</home/jatin/Code/Office/colors-by-nisha/lib/db/schema.ts:66>)), so even a CSV without images deletes existing variant-specific media rows. Cart variant IDs then stop matching; historical order variant references are set null. The unfinished-order guard reduces order risk but does not protect carts or delivered-order references.

**Next step:** Upsert stable variant IDs, retain media associations, and preview destructive changes before import. Test an image-free reimport with variant images and a saved cart.

### F05 · P1 · CSV import collapses products with multiple option dimensions

Only `Option1 Value` is read ([app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:549>)); variants are deduplicated solely by that value ([app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:624>)). An isolated import of M/Red and M/Blue produced one M variant, losing the second option, price and stock.

**Next step:** Represent all supported option dimensions in a stable identity, or explicitly reject unsupported CSVs before modifying data.

### F06 · P1 · CSV matching can overwrite the wrong product when names collide

[app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:660>) resolves by product name before the explicit handle. If product A and product B share a title, importing B's handle can update A; a new handle with an existing title can also overwrite that existing product. Imported variant SKUs are collected but replaced with generated SKUs at [app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:728>), so they do not provide a stable matching key.

**Next step:** Match by explicit unique handle/ID first; reject ambiguous name matches and preserve or deliberately map source variant identifiers.

### F07 · P1 · Sample catalog fallback can resurrect unpublished products

[helpers/store/products.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/store/products.ts:73>) falls back to `productsData` whenever no published row is found or the database fails. A draft/deleted/archived item whose slug matches a sample can still have a public PDP. Related products also fall back at line 99. [app/api/search/route.ts](</home/jatin/Code/Office/colors-by-nisha/app/api/search/route.ts:10>) returns sample inventory on empty/error, and search/wishlist clients initialize from samples and ignore empty results ([components/layout/SearchModal.tsx](</home/jatin/Code/Office/colors-by-nisha/components/layout/SearchModal.tsx:17>), [app/(normal)/wishlist/page.tsx](</home/jatin/Code/Office/colors-by-nisha/app/(normal)/wishlist/page.tsx:17>)). These sample records can appear purchasable while [components/store/StoreContext.tsx](</home/jatin/Code/Office/colors-by-nisha/components/store/StoreContext.tsx:110>) rejects their non-UUID IDs.

**Next step:** Make published database records the production source of truth. Distinguish empty catalog, not found and service failure; keep samples behind an explicit development mode.

### F08 · P1 · Webpack fallback build completes without generating Tailwind utilities

[next.config.ts](</home/jatin/Code/Office/colors-by-nisha/next.config.ts:62>) installs Tailwind only as a Turbopack loader. There is no equivalent PostCSS setup for webpack. The completed `npm run build -- --webpack` output retained literal `@tailwind utilities` and `@theme inline`, and lacked `.grid`, `.font-display` and `.bg-purple`. This build's exit code is not a valid styling check. The default Turbopack build was blocked by the execution environment, so this does not establish that the intended Turbopack build is broken.

**Next step:** Verify and deploy the intended Turbopack production build in a permitted environment. If webpack is supported, configure and verify Tailwind for it too; do not deploy the current fallback artifact.

### F09 · P2 · Homepage merchandise is not synchronized with the catalog

Featured sections import product names/prices/images from `data/home.ts`, including [components/home/CurrentlyObsessedSection.tsx](</home/jatin/Code/Office/colors-by-nisha/components/home/CurrentlyObsessedSection.tsx:1>), [components/home/HandpickedSection.tsx](</home/jatin/Code/Office/colors-by-nisha/components/home/HandpickedSection.tsx:1>) and [components/home/SpotlightSection.tsx](</home/jatin/Code/Office/colors-by-nisha/components/home/SpotlightSection.tsx:1>). Product quick view subsequently loads the live catalog. Admin price, publication and availability changes therefore need not match the homepage cards.

**Next step:** Store curated product references and resolve current display details from published catalog records.

### F10 · P2 · CSV import overwrites manual content and invents product specifications

[app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:672>) replaces descriptions and SEO fields on every update. The short-description generator ([app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:275>)) fills absent fabric, components, embellishment and occasion information with assumptions. A minimal mock CSV generated claims including a blouse, handcrafted embellishments and a component count that were never supplied.

**Next step:** Preserve manually maintained fields unless explicitly included; only publish factual specifications supplied by the source, with a reviewable import preview.

### F11 · P2 · CSV validation silently changes prices and bypasses normal product limits

[app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:584>) removes non-digit characters before parsing. The real importer changed `-120` to `120.00` in isolation; invalid/blank values can become active zero-price products that checkout refuses. The importer does not reuse normal form length/image-count/URL checks, so some malformed imports fail only at database or rendering time.

**Next step:** Use the same bounded product validation for CSV and forms, reject invalid prices, and return row-specific errors before starting a transaction.

### F12 · P2 · Deleting product media can break saved order images

Orders store the original media key ([helpers/orders/service.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/orders/service.ts:64>)) and resolve that same key when displayed (line 81). Product save/delete cleans up S3 keys without checking order snapshot references ([app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:109>), [app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:134>)). Existing order images can disappear after catalog media is replaced.

**Next step:** Retain media referenced by orders or copy durable order thumbnails; include those references in cleanup decisions.

### F13 · P2 · Empty or unavailable blogs publish sample articles

[helpers/public-blogs.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/public-blogs.ts:71>) and its catch handler at line 106 return static articles on empty results or failure. [components/blog/BlogPageContent.tsx](</home/jatin/Code/Office/colors-by-nisha/components/blog/BlogPageContent.tsx:13>) repeats the empty-list fallback. Removing every published blog therefore does not produce an empty journal, and database errors look like successful publication.

**Next step:** Return explicit empty/error states in production and keep demonstration content separate.

### F14 · P2 · Contact administration still uses a preview workflow

[app/admin/contact/page.tsx](</home/jatin/Code/Office/colors-by-nisha/app/admin/contact/page.tsx:25>) gives every saved enquiry status New, and line 41 substitutes sample enquiries when the database is empty or unavailable. [components/admin/RecordsPage.tsx](</home/jatin/Code/Office/colors-by-nisha/components/admin/RecordsPage.tsx:66>) changes status only in React state and explicitly resets it on reload. There is no persisted enquiry status in the schema.

**Next step:** Show real empty/error states and either persist enquiry management or remove controls that imply saved workflow changes.

### F15 · P2 · Payment administration hides database failures

[app/admin/payments/page.tsx](</home/jatin/Code/Office/colors-by-nisha/app/admin/payments/page.tsx:62>) catches query failures and renders an empty list. A missing payment table, lost database connection and a legitimate lack of transactions all look the same.

**Next step:** Show a recoverable error and record the failure; reserve the empty state for a successful query with no records.

### F16 · P2 · Admin retry button does not refetch failed server content

[app/admin/error.tsx](</home/jatin/Code/Office/colors-by-nisha/app/admin/error.tsx:3>) uses `reset`. The installed Next 16.4.3 error-boundary documentation says `reset` only clears/re-renders the boundary; `retry` refetches its content. The public error boundaries already use `retry`. A server/database failure can remain after clicking the admin Try again button.

**Next step:** Use the installed framework's refetching retry API and exercise it after a simulated server failure.

### F17 · P1 · Shipping promises and the amount collected disagree

[components/store/CartDrawer.tsx](</home/jatin/Code/Office/colors-by-nisha/components/store/CartDrawer.tsx:46>) promises free shipping at ₹10,000. The cart and checkout say shipping is confirmed separately ([components/checkout/CheckoutContent.tsx](</home/jatin/Code/Office/colors-by-nisha/components/checkout/CheckoutContent.tsx:157>)), while [components/orders/OrderSummary.tsx](</home/jatin/Code/Office/colors-by-nisha/components/orders/OrderSummary.tsx:13>) labels shipping Complimentary for every order. [helpers/orders/service.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/orders/service.ts:57>) sets total equal to subtotal and stores no calculated shipping charge.

**Next step:** Approve one shipping rule, calculate the final payable total on the server, and use the same result in cart, checkout, order details and policies.

### F18 · P2 · Quantity selectors can request more than the cart actually adds

PDP/quick-view/sticky selectors allow stock-based or unbounded quantities ([components/pdp/ProductDetailsInfo.tsx](</home/jatin/Code/Office/colors-by-nisha/components/pdp/ProductDetailsInfo.tsx:127>), [components/shop/QuickViewModal.tsx](</home/jatin/Code/Office/colors-by-nisha/components/shop/QuickViewModal.tsx:181>)). [components/store/StoreContext.tsx](</home/jatin/Code/Office/colors-by-nisha/components/store/StoreContext.tsx:116>) caps additions at 99 or remaining stock and still reports success, so selecting ten with only two remaining cart slots adds two without explaining the difference.

**Next step:** Share the same quantity limit across controls and mutation logic; report the actual amount added or reject an over-limit request.

### F19 · P2 · Some quick-add controls ignore add-to-cart failure

[components/shop/ShopProductCard.tsx](</home/jatin/Code/Office/colors-by-nisha/components/shop/ShopProductCard.tsx:35>) ignores the boolean result of `addToCart`. [app/(normal)/wishlist/page.tsx](</home/jatin/Code/Office/colors-by-nisha/app/(normal)/wishlist/page.tsx:150>) opens the cart even if adding failed. An existing stock-limit item or invalid sample entry can produce no useful feedback.

**Next step:** Handle failure explicitly and give a reason; open the cart as a success response only after a successful add.

### F20 · P3 · Recently viewed does not track ordinary product visits

The only record calls are in [components/store/ProductCard.tsx](</home/jatin/Code/Office/colors-by-nisha/components/store/ProductCard.tsx:53>) and the wishlist. The main shop card and direct PDP visits do not record a view. [app/(normal)/wishlist/page.tsx](</home/jatin/Code/Office/colors-by-nisha/app/(normal)/wishlist/page.tsx:18>) reads recent views once and does not subscribe to changes.

**Next step:** Record views in the actual product detail flow using stable product identifiers, and refresh/subscribe where the list is displayed.

### F21 · P2 · Newsletter form is unfinished

[components/layout/Footer.tsx](</home/jatin/Code/Office/colors-by-nisha/components/layout/Footer.tsx:94>) only sets local subscribed state. It sends no request and saves no email; its success text says this preview does not send subscriptions.

**Next step:** Connect an approved subscription flow with validation and clear success/error states, or remove the signup invitation before launch.

### F22 · P2 · Search loads the entire catalog, including when search is closed

[helpers/store/products.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/store/products.ts:63>) loads all products with their variants/media. [app/api/search/route.ts](</home/jatin/Code/Office/colors-by-nisha/app/api/search/route.ts:10>) filters after that full read and returns full records for an empty query. [components/layout/SearchModal.tsx](</home/jatin/Code/Office/colors-by-nisha/components/layout/SearchModal.tsx:20>) fetches it on every root mount regardless of visibility, and [app/layout.tsx](</home/jatin/Code/Office/colors-by-nisha/app/layout.tsx:36>) mounts search on customer, auth and admin screens. Other catalog clients add duplicate reads. There is no query pagination or shared cross-request cache here.

**Next step:** Load search on demand, query/paginate on the server, return a smaller projection, and add appropriate shared caching and traffic limits.

### F23 · P2 · Blog listing/detail work grows with the entire journal

[helpers/public-blogs.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/public-blogs.ts:47>) selects and sanitizes every article body; fetching one slug calls that full loader at line 118. [components/blog/BlogPageContent.tsx](</home/jatin/Code/Office/colors-by-nisha/components/blog/BlogPageContent.tsx:53>) also puts every article in Popular Posts before repeating all articles in the grid. On mobile the full sidebar appears before the main list.

**Next step:** Use paginated listing projections, query an individual article by slug, cap related/popular lists and reuse request-level results.

### F24 · P2 · Payment-provider latency holds scarce database connections

[helpers/payments/service.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/payments/service.ts:44>) calls Razorpay fetch/create while holding a database transaction and order lock. The pool is limited to five connections ([lib/db/index.ts](</home/jatin/Code/Office/colors-by-nisha/lib/db/index.ts:16>)); [helpers/razorpay.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/razorpay.ts:14>) configures no explicit provider timeout. The browser's abort timeout does not release a server-side provider request or transaction.

**Next step:** Bound provider calls and use a recoverable payment-attempt workflow that minimizes time spent holding a database transaction. Load-test provider timeouts.

### F25 · P2 · Requested font weights were not supplied by the bundled fonts — SOURCE FIXED

[app/layout.tsx](</home/jatin/Code/Office/colors-by-nisha/app/layout.tsx:10>) now loads self-hosted Montserrat and Outfit variable WOFF2 faces with a declared 100–900 weight range. `fc-scan` confirmed both files expose a variable weight axis. Browser comparison of headings, buttons and body remains pending.

### F26 · P2 · Published blog typography did not match the editor preview — SOURCE FIXED

[components/admin/blogs/BlogContentFrame.tsx](</home/jatin/Code/Office/colors-by-nisha/components/admin/blogs/BlogContentFrame.tsx:6>) supports saved line/paragraph-spacing attributes, 16px body text, purple headings/links and a table wrapper. [components/blog/BlogPostDetailContent.tsx](</home/jatin/Code/Office/colors-by-nisha/components/blog/BlogPostDetailContent.tsx:125>) uses 14/15px body text, different heading weights/colors and table rules, and ignores the saved spacing attributes. The sanitizer deliberately preserves those attributes.

The public article now uses `BlogContentFrame`, matching preview typography, saved spacing attributes and responsive table treatment. Browser confirmation is still needed.

### F27 · P2 · PDP question dialog and gallery lightbox lacked keyboard modal behavior — SOURCE FIXED

[components/pdp/ProductDetailsInfo.tsx](</home/jatin/Code/Office/colors-by-nisha/components/pdp/ProductDetailsInfo.tsx:224>) and [components/pdp/ProductGallery.tsx](</home/jatin/Code/Office/colors-by-nisha/components/pdp/ProductGallery.tsx:199>) render dialogs without Escape handling, focus containment, focus return or a body scroll lock. Their dialog names are also not connected to visible headings. Keyboard/screen-reader users can remain behind the overlay or navigate into background content.

The question dialog uses the shared modal component; the gallery lightbox now uses a portal, named dialog and contained focus with Escape, scroll locking and focus restoration. The lightbox opener is keyboard-operable. Browser keyboard review remains pending.

### F28 · P2 · Other overlays had incomplete focus handling — SOURCE FIXED

[components/store/CartDrawer.tsx](</home/jatin/Code/Office/colors-by-nisha/components/store/CartDrawer.tsx:1>), [components/layout/SearchModal.tsx](</home/jatin/Code/Office/colors-by-nisha/components/layout/SearchModal.tsx:37>) and the mobile filter in [components/shop/ShopPageContent.tsx](</home/jatin/Code/Office/colors-by-nisha/components/shop/ShopPageContent.tsx:487>) handle some scrolling/Escape behavior but lack full focus containment. The shared [components/ui/Modal.tsx](</home/jatin/Code/Office/colors-by-nisha/components/ui/Modal.tsx:18>) trap excludes textarea/contenteditable and includes disabled controls, so its boundary calculation can also fail in form dialogs.

The shared behavior filters disabled/hidden controls, supports textarea, editable content, media controls and embedded browsing surfaces, contains focus, restores focus, handles Escape and reference-counts body scroll locks across layered dialogs. Browser keyboard review for Tab wrap and nested close order remains pending.

### F29 · P2 · Search result cards were not keyboard-operable — SOURCE FIXED

Both result cards are semantic buttons with visible focus styles and open the same quick-view action for keyboard users.

### F30 · P2 · Contact and search fields relied on placeholders instead of labels — SOURCE FIXED

Contact fields now have associated screen-reader labels. Search fields have explicit accessible names. Browser screen-reader validation remains pending.

### F31 · P2 · Some customer-facing small secondary text had insufficient contrast — PARTIALLY FIXED

Cart, checkout, order details and account details now use darker neutral text for functional small information. Neutral-400 remains on decorative icons, price comparisons, admin screens and some ancillary labels; audit these by rendered context before claiming a complete contrast pass. Contrast here is still source-level, not screenshot-measured.

### F32 · P2 · Hero slide dots were too small to target reliably — SOURCE FIXED

Slide indicators now use 24×24px buttons while preserving their small visual dots. Browser target-size confirmation remains pending.

### F33 · P2 · Autoplay lacked a persistent user pause control — SOURCE FIXED

The hero now has a persistent pause/play control, and the automatic product/social rails have pause controls. Reduced-motion users can opt in through Play. Browser interaction remains unverified.

### F34 · P2 · Page landmarks and heading structure were inconsistent — SOURCE FIXED

About has a stable H1; search retains its H1 when showing results; the nested blog main is now a section; the normal layout has a skip link; checkout now supplies a main landmark. Browser landmark and skip-link verification remains pending.

### F35 · P3 · Several animation class names produced no CSS — SOURCE FIXED

The requested enter, fade, zoom and slide utilities are now defined in the Tailwind stylesheet with reduced-motion handling. The production build succeeds; rendered transitions still need browser review.

### F36 · P2 · Product thumbnails and hero slides load original images

Remote images deliberately bypass optimization in gallery/cards/quick view, e.g. [components/pdp/ProductGallery.tsx](</home/jatin/Code/Office/colors-by-nisha/components/pdp/ProductGallery.tsx:220>). Uploads permit originals up to 5MB; thumbnails can therefore download those originals. [components/home/HeroBanner.tsx](</home/jatin/Code/Office/colors-by-nisha/components/home/HeroBanner.tsx:77>) eagerly loads every slide unoptimized, including hidden slides.

**Next step:** Serve appropriately resized/formatted image variants with accurate sizes; prioritize the first hero and defer later slides. Measure LCP and bytes on representative mobile pages.

### F37 · P2 · Absolute metadata URL base is missing

[app/layout.tsx](</home/jatin/Code/Office/colors-by-nisha/app/layout.tsx:22>) defines no `metadataBase`; the build warned that it defaults to http://localhost:3000. Relative Open Graph images from product/blog content can consequently resolve to a local URL in generated metadata.

**Next step:** Configure the approved public origin and verify absolute social image URLs in the final production HTML.

### F38 · P2 · Canonical and crawl/discovery setup is incomplete

No canonical URLs, sitemap route/file, robots file or Product/Article structured data were found. [next.config.ts](</home/jatin/Code/Office/colors-by-nisha/next.config.ts:34>) rewrites legacy collection/blog URLs rather than redirecting, leaving multiple URLs for the same content without canonical guidance. Some sensitive pages correctly set noindex metadata; that does not replace canonical/discovery setup.

**Next step:** Define the public origin and URL policy, redirect/canonicalize legacy aliases, generate a published-content sitemap and deliberate robots rules, and add validated structured data where appropriate.

### F39 · P2 · Saved SEO titles are ignored or receive duplicate branding

[helpers/public-blogs.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/public-blogs.ts:59>) selects blog metaTitle but omits it from the returned post, so [app/(normal)/blog/[slug]/page.tsx](</home/jatin/Code/Office/colors-by-nisha/app/(normal)/blog/[slug]/page.tsx:24>) always uses the visible article title. CSV product titles already contain a brand suffix, while [app/(normal)/products/[handle]/page.tsx](</home/jatin/Code/Office/colors-by-nisha/app/(normal)/products/[handle]/page.tsx:14>) appends another.

**Next step:** Carry saved metadata through public data mapping and apply a single consistent title-template rule.

### F40 · P3 · OTP copy is incorrect for phone and authenticator flows

[components/auth/AuthPage.tsx](</home/jatin/Code/Office/colors-by-nisha/components/auth/AuthPage.tsx:425>) always says a six-digit code was sent to verify email. The lower panel partly distinguishes phone/TOTP at line 447, but still says Verification Code Sent for TOTP and uses the email value as its identifier. These messages conflict during supported MFA paths.

**Next step:** Derive all instructions and destination text from the active verification strategy; test email, phone, TOTP and recovery flows.

### F41 · P2 · Checkout can get stuck reusing a cancelled unpaid order

[components/checkout/CheckoutContent.tsx](</home/jatin/Code/Office/colors-by-nisha/components/checkout/CheckoutContent.tsx:103>) reuses a session-stored order ID for the same cart/address fingerprint. [helpers/orders/service.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/orders/service.ts:45>) returns an existing owned order without checking its status, while [helpers/payments/service.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/payments/service.ts:48>) rejects payment for a cancelled order. A mocked execution confirmed that placeOrder reuses the cancelled ID and prepareOrderPayment then rejects it. Cancellation does not clear this checkout key; [components/orders/PaymentStatus.tsx](</home/jatin/Code/Office/colors-by-nisha/components/orders/PaymentStatus.tsx:18>) clears it only after payment. Create an unpaid order, cancel it in admin, then retry the unchanged checkout in the same tab: the cancelled ID is reused.

**Next step:** Keep retry idempotency for payable orders, but explicitly start a new attempt after cancellation and clear the obsolete client attempt state.

## Visual consistency candidates requiring browser review

These are source-observed differences or layout risks. No rendered clipping, alignment or cross-device result is claimed. Fixing a difference should follow the intended design rather than flattening all typography indiscriminately.

### V01 · CTA typography and spacing differ

The shared [components/ui/Button.tsx](</home/jatin/Code/Office/colors-by-nisha/components/ui/Button.tsx:9>) uses 12/14px text, 40/48px minimum height, a gold border and white text. About CTAs ([app/(normal)/about/page.tsx](</home/jatin/Code/Office/colors-by-nisha/app/(normal)/about/page.tsx:184>), line 214), wishlist and search CTAs use separate sizes, padding, pale text and gold hover fills. These differences are source-confirmed; decide which are intentional and standardize equivalent actions.

### V02 · Title sizing and weight differ across equivalent surfaces

[components/cart/CartPageContent.tsx](</home/jatin/Code/Office/colors-by-nisha/components/cart/CartPageContent.tsx:32>) uses a 48px desktop title while shop/blog/policy headings generally use 36px. Quick-view product titles use a different weight/tracking from the PDP. Compare together at desktop/mobile sizes before treating every variation as a defect.

### V03 · Collection captions inherit left alignment — SOURCE FIXED

Collection labels now center-align and wrap within the image cards. Confirm their rendered crop, contrast and alignment on narrow phones.

### V04 · About mosaic labels may clip near the tablet breakpoint — SOURCE MITIGATION

About mosaic labels now have a constrained width, wrapping and responsive padding. Verify the 768–900px layouts in a browser before closing this candidate.

### V05 · Desktop lightbox stacking — SOURCE FIXED

The lightbox now portals to `document.body`, so it is outside the sticky gallery stacking context. Confirm stacking against the fixed header in a browser.

## Deployment and business limitations

These include known architectural choices and missing operational evidence. They are separated from defects so existing decisions are not silently treated as authorization to redesign payments, persistence or policies.

### R01 · Distributed abuse protection is unverified

[helpers/security/requests.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/security/requests.ts:57>) keeps counters in a process-local Map. Limits reset on restart and multiply across instances. IP keys trust the first x-forwarded-for/x-real-ip value (line 73), so bypass depends on how the deployment sanitizes those headers. Use a shared/platform limiter and confirm trusted proxy behavior; this is not proof of a deployed bypass. Public catalog GETs have no application throttle.

### R02 · Two customers can pay for the final unit

Availability is checked before payment but stock is deducted after capture ([helpers/payments/service.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/payments/service.ts:51>), [helpers/orders/service.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/orders/service.ts:109>)). Transactions prevent negative inventory, but cannot prevent both gateway captures. [docs/security-review.md](</home/jatin/Code/Office/colors-by-nisha/docs/security-review.md:1>) records this as a previously requested business choice. Launch needs an accepted shortage/refund process and alerting; guaranteed reservation is a separate product decision.

### R03 · Refunds are manual and not reconciled into application records

[app/api/webhooks/razorpay/route.ts](</home/jatin/Code/Office/colors-by-nisha/app/api/webhooks/razorpay/route.ts:15>) handles capture/order-paid/failed events, not refunds. The admin can display Refunded, but no refund reconciliation path sets that state. Cancelled paid orders retain captured payment/gross collection values. Define provider refund handling, refund audit records, partial/full refund display and net-revenue reporting as needed.

### R04 · Pending orders have no expiry or price-validity window

No expiry job/state was found. [app/admin/products/actions.ts](</home/jatin/Code/Office/colors-by-nisha/app/admin/products/actions.ts:23>) treats pending orders as unfinished indefinitely, blocking destructive product/variant operations. Payment preparation uses the old saved total and current stock without a time limit ([helpers/payments/service.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/payments/service.ts:49>)). Decide how long an unpaid quote is honored and how abandoned orders are closed.

### R05 · Order-update promises need an actual delivery channel

[components/checkout/CheckoutContent.tsx](</home/jatin/Code/Office/colors-by-nisha/components/checkout/CheckoutContent.tsx:145>) labels the customer's email Order updates, and the privacy page promises confirmation/shipping updates. No application email/SMS sender, shipping-notification job or invoice delivery flow was found. Check any provider-side service and agree the customer communication/invoice requirements before launch; do not assume a code-only audit proves those external services exist.

### R06 · Live environment and infrastructure were not verified

Local configuration contains test-mode Clerk and Razorpay key prefixes. This is not evidence about deployed configuration. Verify production Clerk domains/redirects, verified admin allowlist and MFA, live payment keys and capture settings, webhook secrets/subscriptions/retries, database TLS/backups/restores, S3/CDN access and least-privilege IAM. Database and network checks were blocked; no secrets are recorded in this report.

### R07 · CSP is a baseline rather than a script policy

[next.config.ts](</home/jatin/Code/Office/colors-by-nisha/next.config.ts:28>) sets frame-ancestors, object-src and base-uri, but no default-src/script-src. This is defense-in-depth work, not a demonstrated XSS vulnerability. A strict policy needs browser validation with Clerk, Razorpay and Next's streamed output before enforcement.

### R08 · Future blog dates do not schedule publication

[helpers/public-blogs.ts](</home/jatin/Code/Office/colors-by-nisha/helpers/public-blogs.ts:68>) filters only isDraft=false; the public image route uses the same publication condition. A non-draft future-dated article is public immediately. Confirm whether publishDate is merely a display date; if scheduling is intended, apply the time predicate consistently.

### R09 · Release gates and observability are incomplete

No CI workflow or application monitoring instrumentation was found, and [package.json](</home/jatin/Code/Office/colors-by-nisha/package.json:5>) has no test script. Existing tests do not cover a clean migration deployment, destructive CSV imports, browser rendering or live providers. Add a reproducible release check, error/failed-webhook monitoring, payment reconciliation alerts and a tested rollback/restore procedure. Existing console logs are not proof of operational alerting.

### R10 · Cancellation/refund copy disagrees between pages and operational behavior

[app/(normal)/terms-and-conditions/page.tsx](</home/jatin/Code/Office/colors-by-nisha/app/(normal)/terms-and-conditions/page.tsx:141>) forbids cancellation after confirmation; [app/(normal)/customization/page.tsx](</home/jatin/Code/Office/colors-by-nisha/app/(normal)/customization/page.tsx:99>) uses production commencement. The returns page is also absolute while the order service allows administrative cancellations and describes refunds for stock/payment exceptions. Have the business align the wording and actual process. This is a consistency review, not a legal compliance determination.

## API and action coverage

Every route handler in the checkout was inventoried and traced into the relevant helper. The table describes source controls; it is not a live endpoint penetration-test result.

| Route | Methods | Observed controls | Remaining issues/checks |
| --- | --- | --- | --- |
| /api/account | GET, PATCH | Clerk session; address ownership/user locking; write origin/type/body limits; per-user limiter | Live account/profile/session-revocation flow unverified; R01/R06. |
| /api/auth/sync | POST | Clerk session; origin check; per-user limiter | Provider/database failures and Google return flow need live testing. |
| /api/cart | POST | Public quote; origin/type/body limits; IP limiter; server prices and aggregate stock | F04/F07/F18; distributed limiter R01. |
| /api/orders | POST | Clerk session; owned idempotent order ID; validated address/terms; authoritative quote | F01/F17/F41 and lifecycle R04. |
| /api/orders/[id]/payment | GET | Clerk session; ownership; origin check; no-store; per-user limiter | Provider reconciliation reads can settle a verified capture; R02/R03/R06. |
| /api/payment/razorpay/create-order | POST | Session/ownership; input limits; per-user limiter; availability and amount checks | Missing payment migration F01; locked provider calls F24. |
| /api/payment/razorpay/verify | POST | Ownership; saved gateway binding; HMAC; provider amount/currency/capture verification | Live capture, retries and duplicate callbacks still need provider tests. |
| /api/webhooks/razorpay | POST | Bounded raw body; HMAC; stored order binding; amount/currency/capture validation | Refund events not reconciled (R03); configure retries and alerting. |
| /api/webhooks/clerk | POST | Bounded body; Clerk SDK signature/timestamp verification; stale/deleted-user handling | Live subscription and delivery configuration unverified. |
| /api/admin/orders/[id] | PATCH | Verified admin allowlist; origin/body checks; revision and status validation | Real admin fulfillment/cancellation flow unverified. |
| /api/admin/products/media/[id] | GET | Independent admin check and ID validation | S3 availability and content delivery unverified. |
| /api/admin/blogs/[id]/image | GET | Independent admin check and ID validation | S3/legacy inline-image delivery unverified. |
| /api/blogs/[id]/image | GET | Valid UUID and published-blog filter | Publication-date limitation R08; delivery and caching need runtime checks. |
| /api/products/[identifier] | GET | Published catalog projection; explicit not-found/error responses | No route-level traffic guard; catalog media runtime unverified. |
| /api/search | GET | Public catalog read | Sample fallback F07; full-catalog query and response F22. |

Server Actions reviewed: product save/delete/list/CSV import; category save/delete/list; blog save/delete/list/preview and blog category management; image upload/discard; public contact submission. Admin mutations independently call verified-email authorization. Contact submission validates input and uses a per-IP burst limit in addition to framework Server Action protections. The importer is authenticated; its findings concern data integrity, not unauthenticated access.

## Protections already present

- Admin access checks use verified Clerk email allowlisting in both middleware and server operations; editable profile metadata does not grant admin status.
- Customer order and payment access is checked against ownership; deleted user records are excluded from ownership queries.
- Checkout calculates prices/options on the server, checks aggregate requested stock, and requires acceptance of terms. Order creation uses an owned idempotency ID.
- Payment confirmation checks a saved gateway binding, HMAC, currency, amount and captured status. Row locks and replay checks prevent repeated stock deductions. Cancellation restoration has guarded transitions.
- Clerk webhooks use SDK signature/timestamp verification; Razorpay validates the bounded original request body.
- Drizzle queries parameterize supplied values. Saved and public blog HTML are sanitized with restricted tags, attributes and URL schemes.
- Image upload is admin-only, bounded by MIME/signature/size checks, and uses signed upload receipts and owned key prefixes. No public unauthenticated upload surface was found.
- Customer writes have origin/Fetch Metadata, content-type and byte-limit checks; friendly errors avoid exposing raw database/provider failures. Some provider calls outside try blocks still rely on framework error handling, so runtime outage testing remains useful.
- Security headers restrict framing, MIME sniffing and referrers; production HSTS is configured. The CSP limitations are described in R07.
- No tracked environment file was found. Configuration values were not included in the report. This is not a complete Git-history secret scan or verification of deployed secret handling.

## Page and component coverage

| Area | Reviewed scope | Principal findings |
| --- | --- | --- |
| Global shell and home | Header/footer/mobile navigation, hero, collection and featured sections, rails, media, cart/search overlays | F09, F21–F22, F25, F28–F33, F35–F36; V01/V03. |
| Shop, search and wishlist | Filters/sort, product cards, quick view, cart options, sample fallbacks, recent views | F04, F07, F18–F20, F22, F28–F30. |
| Product pages | Database mapping, variants, price/stock, media/gallery, sticky purchase UI, question dialog, related products | F07, F18, F25, F27, F36, F39; V02/V05. |
| Cart and checkout | Persistent cart, quote refresh, addresses, terms, idempotency, provider handoff and recovery | F17–F19, F24, F31, F41; R02–R06. |
| Auth and account | Login/signup/reset/OTP/OAuth callback, completion/profile dialogs, address ownership/defaults and session revocation | F25/F28/F40; live Clerk/MFA/account tests pending. |
| Customer orders | Ownership, details, payment reconciliation, stock allocation, delivery/cancellation display | F01/F12/F17; R02–R05. |
| About/contact/policies | Responsive source layout, form validation/action, labels, business copy and landmarks | F01/F14/F30/F34; V01/V04; R10. |
| Blog/editor | Public and admin loaders, HTML sanitization, media, metadata, formatting and publication filters | F13/F23/F26/F34/F39; R08. |
| Admin | Dashboard, product/category/blog forms/actions, CSV import, orders, users, contacts, payments, error recovery | F01–F06, F10–F16, F24; R03/R04. |
| Infrastructure | Schema/migrations, storage, request guards, payment/webhook services, build tooling and assets | F01/F02/F08/F22/F24/F35–F38; R01/R06/R07/R09. |

Unused preview components and duplicate assets were distinguished from active flows. For example, the old StoreDialog/ProductListPanel preview and unused SizeGuideModal were not reported as live checkout defects merely because preview text or incomplete behavior exists in their source.

## Required release verification

1. Repair the migration chain and prove clean-database creation plus an upgrade against a disposable copy. Check payment/contact persistence, long descriptions, foreign keys and indexes.
2. Address the CSV data-loss/publication defects and remove production sample fallbacks. Reimport realistic multi-option CSVs without losing IDs, images, stock or manual content.
3. Agree shipping, unpaid-order expiry, shortage handling, refunds and customer notifications. Verify that displayed promises match captured amounts and operations.
4. Produce a valid production build with generated CSS. Serve that exact artifact and inspect console/network errors, hydration, error recovery and public metadata.
5. Review every page family at 320, 375/390, 768, 1024 and 1440px, including 200% zoom, long names, missing images, empty/error/loading states and mobile landscape. Compare header/container edges, section gaps, baselines, button sizes, text wrapping and sticky offsets. Check drawer/lightbox stacking and bottom-navigation overlap.
6. Run keyboard/screen-reader checks for dialogs, search, forms, status messages and navigation, plus reduced-motion/autoplay controls and rendered contrast.
7. Test Clerk sign-in/signup/reset/Google/MFA, account completion, saved addresses, cross-account denials and direct admin-action denials in a safe staging environment.
8. Exercise Razorpay test-mode success, failure, cancellation, delayed capture, duplicate/reordered webhooks, callback loss, refresh recovery, two buyers for the final unit, refund reconciliation and provider timeouts. Confirm production configuration separately before switching to live payments.
9. Complete a current dependency/advisory scan, trusted-proxy/rate-limit review, external media checks, backup restore test and monitoring/alert validation. Run Lighthouse/Web Vitals against representative real catalog data; no performance score is claimed here.

The source review is complete enough to identify concrete release blockers, but production approval remains open until these runtime and deployment checks are performed. A finite audit cannot establish the absence of all remaining defects.

