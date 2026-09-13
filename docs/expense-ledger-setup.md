# Expense ledger setup and use

The live ledger uses the existing `Tokyo-family-travel-expenses` Supabase project.
Its two-member database allowlist and RLS policies are defined in
`supabase/migrations/202609130001_expense_ledger.sql`. Do not rerun the migration
against a populated project without reviewing its effects first.

## Signing in from a home-screen app

The current Supabase default sign-in email contains a magic link, not a numeric
code. Its email template cannot be edited in this project without configuring
custom SMTP. The guide therefore keeps the default template and offers a
paste-link flow that completes sign-in **inside the installed app**:

1. Open the guide from the home-screen icon and request a sign-in email using
   an enrolled member address.
2. In the email app, **copy** the `Sign in` link without opening it.
3. Return to the home-screen guide, paste the link, and press
   `在此完成登入`. The app accepts only this project's Supabase verification URL
   and exchanges its one-time token with Supabase Auth. It does not navigate to
   the link or save it in the expense database.
4. The Supabase browser client persists and refreshes the resulting session in
   that app's local storage. A new email is **not** required on each launch.
   Sign-out, cleared site data, revoked credentials, or an expired/invalidated
   session will require signing in again. Browser and installed-app storage may
   be separate, so signing in through the browser does not reliably sign in
   the home-screen app.

Treat the email link like a temporary password: do not share it or paste it in
chat. If already opened, request a fresh link. The `shouldCreateUser: false`
setting prevents visitors from creating accounts through the guide.

## Expense data and removed OCR

The form now requires manual entry of date, merchant/purpose, amount, currency,
category, sharing type, split, and optional note. It retains the two-person
shared/private RLS boundaries and JPY/TWD separate totals. No receipt image is
collected or sent to Google Document AI by the guide.

After the revised website is approved and published, remove the obsolete
`receipt-ocr` Edge Function and `GOOGLE_SERVICE_ACCOUNT_JSON` Edge Function
secret from this exact Supabase project. Do **not** delete the underlying
Google Cloud processor or downloaded key as part of this website change.

For QA, test one member's manual save and session persistence in the installed
app, and use both adults' accounts to test private expense isolation and shared
settlement. Do not leave QA expenses in production.
