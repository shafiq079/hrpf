# Donation payment details — 8 October 2026

The owner requested payment information instead of a live payment feature.
`/donate` retains its existing header action and canonical URL, with bank transfer
and JazzCash cards, transfer steps and direct email enquiries.

## Source values

Primary source: `information/given pages text.txt`, Bank Account Details section.
Bank details also match `PROFILE HRPF.docx` and the existing source manifest.

| Field | Published value |
| --- | --- |
| Account title | Human Rights Protection Foundation |
| Bank | ABHI Micro Finance Bank |
| Account number | 90099009181133945000 |
| IBAN | PK42ABHI9009181133945000 |
| Branch | SA Rehman Stop, Dhobi Ghat Dharogewala, opposite Shell petrol pump, Lahore |
| JazzCash | 0322-2670590 |

Fixed values live in `frontend/data/paymentDetails.ts`. No Easypaisa account was
supplied. No JazzCash recipient title, QR code, RAAST ID, tax-exemption claim or
refund/receipt guarantee is invented. IBAN length/checksum checks are transcription
checks, not verification of account ownership or transfer availability.

## Behaviour

- Remove the unused demonstration DonationForm, amount/frequency/project controls,
  donor inputs, unavailable provider notice and prototype receipt/refund promises.
- Copy account number, IBAN or JazzCash using a keyboard-accessible button. A live
  status reports success; blocked clipboard access offers manual copying.
- Transfer identifiers remain exact, selectable and left-to-right under translation.
  Recipient title, bank name and JazzCash brand are also excluded from translation.
- Donors transfer through their own bank or JazzCash. This page collects no donor
  data, initiates no payment, verifies no transfer and issues no automatic receipt.
- Email questions directly to the supplied HRPF contacts, with transaction reference
  if relevant. Avoid relying on the simulated general Contact form.
- Only donation FAQs are updated; unrelated FAQ groups remain a later task.

## Verification

Frontend lint/typecheck/build and existing public SSR/navigation checks, expanded
with exact bank/wallet values and absence of a donor form or prototype notices.
Before the interruption, desktop/390px/320px screenshots showed the intended
layout and successful copy statuses. On resume, lint, types, production build and
public SSR/navigation checks passed. A repeat browser check was blocked: the local
browser binary download was truncated and the cloud browser could not reach the
local preview. Full provider translation and blocked-clipboard browser coverage
are therefore not claimed for this continuation.
These checks cover the website UI, not live financial transactions.

Development / PR #9 remains the review target; no backend, database seed or provider
configuration changes are required. Main merge is separate.
