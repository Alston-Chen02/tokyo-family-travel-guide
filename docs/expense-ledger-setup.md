# Expense ledger setup (candidate only)

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
6. Keep the Google Cloud Document AI path disabled until the owner has set up
   Google Cloud billing, enabled Document AI, and approved receipt transmission
   and the cost. OCR must fill a review form, not automatically create an
   expense. No receipt image is currently uploaded or retained.

The Supabase URL and **publishable** key are embedded in the browser bundle;
they are public identifiers, not authorization. RLS and the member allowlist
are the security boundary. Never put a Supabase secret/service-role key,
database password, or Google service-account credential in this repository or
browser bundle.

Existing fixed trip-budget numbers are informational and are not inserted into
the actual expense ledger.
