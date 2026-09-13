# Expense ledger setup and use

The live ledger uses the existing `Tokyo-family-travel-expenses` Supabase project.
Its two-member database allowlist and RLS policies are defined in
`supabase/migrations/202609130001_expense_ledger.sql`. Do not rerun the migration
against a populated project without reviewing its effects first.

## Signing in from a home-screen app

The two existing, confirmed Supabase members can each set a distinct password
while signed in: open the ledger, expand `設定或更換登入密碼`, and enter a new password
of at least 12 characters. This calls Supabase Auth `updateUser`, not the
expenses table. Afterward, `以密碼登入` signs in directly inside the installed
home-screen app without sending an email. Passwords must never be committed,
shared between members, or placed in the expense database.

For an account that has not yet set a password, expand `尚未設定密碼？使用登入信`.
The default email contains a magic link, not a numeric code. Copy its `Sign in`
link without opening it, paste it back into the installed guide, and press
`在此完成登入`. The guide verifies that the link belongs to this Supabase project,
then exchanges its one-time token directly with Supabase Auth. Do not share
the link or paste it into chat. If it was already opened, a fresh link is needed.
The `shouldCreateUser: false` setting prevents website visitors from creating
accounts through this fallback.

Supabase's built-in email service remains rate-limited even on Pro. Custom SMTP
is still advisable for reliable account recovery, but is not needed for routine
password sign-in. The Supabase client persists and refreshes a successful
session in the app's own local storage. Sign-out, cleared site data, revoked
credentials, or an expired/invalidated session requires signing in again;
browser and installed-app storage can be separate. No auth method changes the
two-member RLS rules: shared expenses are visible to both, while private
expenses remain visible only to their owner.

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
