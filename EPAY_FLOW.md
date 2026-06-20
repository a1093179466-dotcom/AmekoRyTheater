# EPAY_FLOW.md

This document records the Yingnai EPAY real-payment integration plan. This pass only documents official rules and integration boundaries. It does not replace the current simulated payment flow.

Official sources:

* V2 docs: https://mch.h6c.cn/doc/index.html
* V1 old docs: https://mch.h6c.cn/doc_old.html

Important distinction: the V2 docs state that V2 uses new interface addresses and RSA signing. V1 details such as `submit.php`, `mapi.php`, MD5 signing, `TRADE_SUCCESS`, and the `success` notify response are V1-only reference unless the merchant backend or official support explicitly says to keep using V1.

## Current Status

The app still uses simulated payment:

* `POST /api/orders` creates a `PENDING` order.
* `/orders/[id]` shows order details.
* `POST /api/orders/[id]/pay` is simulated payment only.
* Simulated success calls `finalizePaidOrder`.

EPAY real payment is not connected yet. A frontend redirect or `return_url` must never be treated as verified payment success.

## Confirmed V2 Rules

Confirmed from the current V2 official page:

* Submit data format: `application/x-www-form-urlencoded`.
* Response data format: `JSON`.
* Charset: `UTF-8`.
* Signature algorithm: `SHA256WithRSA`.
* V2 uses RSA signing.
* V1 uses MD5 signing.
* V2 uses new interface addresses.
* V1 uses `submit.php` and `mapi.php` for order submission.
* V2 adds `timestamp` request and response values for timestamp validation.
* RSA keys are generated in merchant backend: personal profile -> API info -> generate merchant RSA key pair.
* Integration needs the platform public key and merchant private key.

## Still Missing From Current V2 Docs

The readable V2 page does not provide these details, so the project must not guess them:

* Full V2 order-create endpoint URL.
* V2 order-create HTTP method.
* Full required field list for V2 order creation.
* V2 field names for merchant id, merchant order number, subject, amount, payment type, notify_url, return_url, etc.
* V2 signing field list.
* Whether V2 excludes `sign`, `sign_type`, and empty values.
* V2 field sorting rule.
* V2 canonical string format.
* V2 URL-encoding rule.
* V2 amount format: `1`, `1.00`, cents, or something else.
* V2 payment-success status field and value.
* V2 notify_url HTTP method.
* Full V2 notify payload field list.
* V2 notify success response content.
* Whether V2 return_url carries a signature.
* Whether return_url must be verified if it carries a signature.
* V2 notify retry and timeout rules.
* Whether V2 supports sandbox / test mode.
* Whether V2 requires IP allowlist, domain binding, or certificate setup.

These must be confirmed from merchant backend, a full official API field page, SDK code, or official support. Do not send real keys in chat.

## V1 Old Rules For Reference Only

The linked old docs confirm these V1 rules. They are useful historical reference, not V2 rules:

* Page payment URL: `https://svipp.004a.cn/submit.php`.
* API payment URL: `https://svipp.004a.cn/mapi.php`.
* Page payment method: `POST` or `GET`, with `POST` recommended.
* API payment method: `POST`.
* V1 amount field `money` example: `1.00`, unit yuan, max 2 decimals.
* V1 payment notification method: `GET`.
* V1 success status: `trade_status=TRADE_SUCCESS`.
* V1 successful notify response: `success`.
* V1 signing algorithm: MD5.
* V1 signing sort rule: parameter names sorted by ASCII ascending order.
* V1 signing exclusions: `sign`, `sign_type`, and empty values are excluded.
* V1 canonical format: `a=b&c=d&e=f`.
* V1 parameter values are not URL-encoded for signing.
* V1 signature: `md5(sortedQuery + KEY)`, lowercase.

Because V2 explicitly switches to RSA and new interface addresses, do not reuse V1 signing rules for V2 real payment unless official support confirms compatibility.

## Environment Variables

Current `.env.example` placeholders:

```env
EPAY_GATEWAY_URL="https://example-epay-gateway.example.com/submit.php"
EPAY_PID="your_epay_pid"
EPAY_KEY="your_epay_key"
EPAY_NOTIFY_URL="https://your-domain.example.com/api/payments/epay/notify"
EPAY_RETURN_URL="https://your-domain.example.com/orders/payment-return"
```

The V2 docs say the integration needs both platform public key and merchant private key. The current `EPAY_KEY` name is only a preflight placeholder. Before real V2 implementation, decide whether to replace it with explicit variables such as:

* `EPAY_MERCHANT_PRIVATE_KEY`
* `EPAY_PLATFORM_PUBLIC_KEY`

Real keys must only live in server `.env.local` or deployment environment variables. Do not commit them and do not send them in chat.

## Provider Structure

Current scaffold:

* `lib/paymentProviders/types.ts`
* `lib/paymentProviders/epay.ts`

`epay.ts` currently only provides:

* EPAY environment reading.
* Config completeness checks.
* A disabled payment request builder placeholder.
* A disabled notify verification placeholder.
* Sanitized callback payload logging helper.

It is not called by current simulated payment and does not change purchase / unlock behavior.

## Future Order Flow

Recommended future real-payment flow:

1. User clicks purchase.
2. `POST /api/orders` creates or reuses a valid `PENDING` order.
3. Backend reads order, post, and user data.
4. Backend creates an EPAY payment request.
5. Frontend redirects to EPAY checkout.
6. User pays on EPAY.
7. EPAY calls backend `notify_url`.
8. Backend verifies signature, order number, amount, and status.
9. Backend calls `finalizePaidOrder`.
10. User returns to `return_url`; the page only reads and displays order status.

## Future API Shape

Recommended future routes:

* `POST /api/payments/epay/create`
  * Requires login.
  * Checks that the order belongs to the current user.
  * Checks that the order is still `PENDING`.
  * Builds EPAY params and signature using the full official V2 field rules.
  * Returns redirect URL or auto-submit form params.

* `POST` or `GET /api/payments/epay/notify`
  * Method must be confirmed from V2 docs.
  * Server-to-server EPAY callback.
  * Does not depend on login cookies.
  * Must verify signature.
  * Must validate amount, order number, and payment status.
  * On success, calls `finalizePaidOrder`.
  * Returns the exact V2 official success response content.

* `GET /orders/payment-return`
  * User browser return page after payment.
  * If V2 return_url carries a signature, verify it before showing detailed result.
  * Even if return_url verification passes, it only reads order state and never marks an order paid.

## Notify URL Rules

`notify_url` must be a public HTTPS URL reachable by EPAY servers.

Recommended production value:

```env
EPAY_NOTIFY_URL="https://668177.xyz/api/payments/epay/notify"
```

If the production domain is not `668177.xyz`, replace it with the real domain.

`localhost`, LAN IPs, and cloud-machine-private addresses cannot be used as production `notify_url`.

A tunnel can be used for integration testing only if:

* It provides a stable public HTTPS URL.
* EPAY can reach it.
* Windows firewall, cloud security group, and reverse proxy ports allow traffic.
* The tunnel domain does not frequently change.

For real paid launch, prefer a fixed domain and HTTPS reverse proxy instead of temporary tunneling.

## Return URL Rules

`return_url` is the browser return page.

Recommended production value:

```env
EPAY_RETURN_URL="https://668177.xyz/orders/payment-return"
```

`return_url` must not:

* Mark an order as paid.
* Create `Purchase`.
* Send purchase notifications.

It only reads backend order state and displays success / pending / failed. Current V2 readable docs do not confirm whether return_url carries a signature. If it carries one, verify it; if not, still do not use it as payment-success authority.

## Signature Verification

Confirmed:

* V2 signature algorithm is `SHA256WithRSA`.
* Integration needs platform public key and merchant private key.
* V2 has `timestamp` request and response values for timestamp validation.

Still missing:

* Signing field list.
* Whether to exclude `sign`, `sign_type`, and empty values.
* Sorting rule.
* Canonical string format.
* URL-encoding rule.
* Whether the signing input charset is fixed as UTF-8.
* Whether the signature output is Base64.
* Exact scenario for merchant private key signing.
* Exact scenario for platform public key verification.
* Allowed timestamp window.

Until these are confirmed, code must not guess V2 signing rules and real payment must stay disabled.

## Idempotency

EPAY notify may be repeated. Backend must be idempotent:

* Find internal order by `Order.orderNo`.
* If already `PAID`, validate amount and provider trade number, then return success.
* Do not duplicate `Purchase`.
* Do not duplicate admin purchase notifications.
* Do not duplicate purchase emails.
* Handling strategy for `CANCELLED` orders needs confirmation before real integration.

`finalizePaidOrder` already centralizes:

* `PENDING` to `PAID` transition.
* `Purchase` upsert.
* Admin purchase notifications.
* Buyer purchase success email.
* Already-paid return path.

Verified EPAY notify should reuse `finalizePaidOrder`; do not duplicate unlock logic inside callback routes.

## Amount And Order Validation

notify_url must validate:

* EPAY order number matches local `Order.orderNo`.
* Local order exists.
* Local amount matches EPAY amount.
* Local order status is allowed by the payment strategy.
* EPAY status is the official V2 success status.
* EPAY provider trade number can be saved to `Order.providerTradeNo`.
* EPAY payment type can be saved to `Order.paymentType`.

V2 amount format is not confirmed by the readable V2 page. V1 `money=1.00` is historical reference only and must not be treated as V2 rule.

## Next Integration Files

Next real integration likely changes:

* `lib/paymentProviders/epay.ts`
* `lib/paymentProviders/types.ts`
* `app/api/payments/epay/create/route.ts`
* `app/api/payments/epay/notify/route.ts`
* `app/orders/payment-return/page.tsx`
* `components/PayOrderButton.tsx` or new `EpayPayButton.tsx`
* `app/orders/[id]/page.tsx`
* `lib/payment.ts`
* `PAYMENT_FLOW.md`

If callback auditing is needed, a new Prisma model such as `PaymentCallbackLog` may be added after V2 fields are confirmed.
