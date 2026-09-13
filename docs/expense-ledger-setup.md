# Expense ledger and receipt OCR setup (candidate only)

This feature is **not live** merely because the website builds. Do not merge
until the database, Auth, and two-account privacy tests have passed.

1. In the existing `Tokyo-family-travel-expenses` Supabase project, review and
   run `supabase/migrations/202609130001_expense_ledger.sql` once. This creates
   an allowlisted two-person ledger with RLS. Anonymous visitors cannot read
   or write the new tables. Private expenses are visible only to their creator.
2. Under Authentication, create or invite the two adults' Auth accounts. The
   frontend intentionally uses `shouldCreateUser: false`, so a public visitor
   cannot sign themselves up through the guide.
3. Add the guide's exact GitHub Pages URL to Supabase Authentication > URL
   Configuration > Redirect URLs. Also add the local development URL when
   testing locally. The email sign-in link must return to an allowed URL.
4. After each adult has an Auth UUID, add **only those two UUIDs** to
   `public.trip_members` via the SQL Editor, with their preferred display
   names. Do not put their emails or UUIDs in the repository. Only an enrolled
   account can access expense rows. The ledger refreshes immediately after a
   local save and every 15 seconds while the page is visible on another device.
5. Test both accounts separately. Check shared expense visibility and 50/50
   settlement; adjustable split; private expense invisibility to the other
   account; anonymous access denial; own-row delete restriction and denied
   updates; JPY and
   TWD separate totals; refresh on both phones; and offline failure messaging.
6. In Google Cloud project `project-04326e30-dccb-453b-bc7`, use the
   `Tokyo-Travel-Receipts` Expense Parser in `asia-southeast1`. The Edge
   Function expects the least-privilege service account for this processor.
   Store its complete JSON **only** as Supabase Edge Function secret
   `GOOGLE_SERVICE_ACCOUNT_JSON`; never paste it into chat, a GitHub
   secret, website source, local `.env` in the repo, or the browser bundle.
   Keep the original downloaded key in a secure private location and rotate
   it if ever exposed. Deploy `supabase/functions/receipt-ocr` with JWT
   verification enabled. The function checks the authenticated user's
   membership via RLS before processing a photo. Receipt photos are sent to
   Google Document AI only after the user presses the recognition button;
   neither the image nor full OCR text is stored in Supabase. OCR only fills
   the editable form, never inserts an expense.
7. Check Google Cloud billing and budget alerts before any live OCR test.
   The trial credit is not an automatic hard spending cap. Test with a
   non-sensitive sample receipt first, then review extracted amount, currency,
   date, and merchant manually. Confirm the function rejects anonymous and
   non-member calls, oversized or non-image input, and a missing secret.
8. Check desktop and mobile Chrome layouts and PWA update behavior. Test a
   member's manual save, classification, shared/private visibility, deletion,
   two-person settlement, and receipt review. Because this release adds no
   public URL buttons, no unchanged site-wide link sweep is required.

The service-account key has not been added to this candidate or deployed by
committing code. The website build alone cannot make OCR functional.

The Supabase URL and **publishable** key are embedded in the browser bundle;
they are public identifiers, not authorization. RLS and the member allowlist
are the security boundary. Never put a Supabase secret/service-role key,
database password, or Google service-account credential in this repository or
browser bundle.

Existing fixed trip-budget numbers are informational and are not inserted into
the actual expense ledger.
