# PAYMENT_FLOW.md

## Current Status

AmekoRyTheater currently uses simulated payment only.

No real payment provider is connected yet. Do not treat any frontend action as a verified payment result.

EPAY integration is in preflight structure only. See `EPAY_FLOW.md`.

Current provider scaffolding:

* `lib/paymentProviders/types.ts`
* `lib/paymentProviders/epay.ts`

The EPAY provider code is intentionally not wired into the order UI, simulated payment API, or `finalizePaidOrder` yet.

## Current Order Lifecycle

1. User clicks the purchase button on a paid work.
2. `POST /api/orders` creates a `PENDING` order.
3. The user opens `/orders/[id]`.
4. The user clicks the simulated payment button.
5. `POST /api/orders/[id]/pay` calls `finalizePaidOrder`.
6. `finalizePaidOrder` marks the order as `PAID`.
7. `finalizePaidOrder` creates or updates the matching `Purchase`.
8. The paid work becomes unlocked for that user.
9. Admin users receive a `POST_PURCHASED` notification.
10. If the buyer enables `emailNotifyPurchase`, the buyer receives a purchase / unlock email. Email failure is logged and does not roll back the payment flow.

## Idempotency Rules

Repeated payment finalization must be safe.

* Repeating payment for an already `PAID` order returns the existing paid state.
* Repeating payment must not create another `Purchase`.
* Repeating payment must not create another admin purchase notification.
* Repeating payment must not change the order amount snapshot.
* A cancelled order cannot be paid.
* A paid order cannot be cancelled.

## Current Boundaries

`POST /api/orders` only creates an order. It must not create a paid `Purchase`.

`Purchase` should only be created after backend-confirmed payment success.

For the current simulated flow, `POST /api/orders/[id]/pay` is the only endpoint that simulates payment success.

## Future EPAY Plan

1. Keep `POST /api/orders` as order creation only.
2. Frontend redirects the user to EPAY with the platform order number.
3. EPAY calls the backend `notify_url`.
4. Backend verifies the EPAY signature.
5. Backend validates payment amount, order number, and payment status.
6. Backend calls `finalizePaidOrder`.
7. Frontend `return_url` only displays the result. It must not mark payment as successful.

Planned route shape:

* `POST /api/payments/epay/create`
* `POST /api/payments/epay/notify`
* `GET /orders/payment-return`

The exact request fields, signing rules, notify method, and success response text must be confirmed from the merchant backend and official docs before implementation.

## Fields To Confirm Before Real Payment

The current `Order` model already has:

* `providerTradeNo`
* `paymentType`
* `paidAt`

Before real payment integration, confirm whether to add:

* raw notify payload storage
* signature verification helpers
* provider status snapshots
* callback request audit logs
* refund-related fields

Confirmed from current V2 docs:

* data submit format: `application/x-www-form-urlencoded`
* response format: JSON
* charset: UTF-8
* signature algorithm: `SHA256WithRSA`
* V2 uses platform public key and merchant private key
* V2 uses timestamp validation

EPAY-specific fields still need confirmation:

* gateway URL
* merchant PID field name and value
* merchant key
* request endpoint and method
* payment type values
* amount format
* notify payload field names
* V2 signature field list, sorting rule, canonical string, encoding, and signature output format
* notify success response text
* return_url parameters
* retry policy and timeout behavior

## Principles

* The frontend cannot decide payment success.
* `Purchase` can only be created after backend-confirmed payment success.
* Payment callbacks must be idempotent.
* Admin purchase notifications should only be sent when an order first transitions to `PAID`.
* Buyer purchase emails should only be sent when an order first transitions to `PAID` and the buyer has `emailNotifyPurchase` enabled.
* Email notification failure must not affect order payment finalization or purchase creation.
* Simulated payment exists only for local development and preflight testing.
* Do not guess EPAY signing rules. Keep real payment disabled until official docs and merchant settings are confirmed.
