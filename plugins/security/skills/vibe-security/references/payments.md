# Payment Security (Stripe)

## Never Trust Client-Submitted Prices

The #1 payment vulnerability in vibe-coded apps: the price comes from the client. An attacker can set any amount, including $0.

```typescript
// BAD: price comes from the request body
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: 'usd',
      unit_amount: req.body.price, // attacker controls this
      product_data: { name: req.body.name },
    },
    quantity: 1,
  }],
});

// GOOD: look up the price server-side
const product = await db.products.findUnique({ where: { id: req.body.productId } });
if (!product) return new Response('Not found', { status: 404 });

const session = await stripe.checkout.sessions.create({
  line_items: [{ price: product.stripePriceId, quantity: 1 }],
});
```

Use Stripe Price IDs (created via the Stripe dashboard or API) rather than constructing prices from your database. This way, prices are defined in Stripe and can't be manipulated.

## Webhook Signature Verification

Stripe webhooks must have their signatures verified. This requires the **raw request body** — parsing the body as JSON first destroys the signature.

```typescript
// Express: webhook route MUST use express.raw() BEFORE express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  // ... handle event
});

// Next.js App Router: use request.text(), NOT request.json()
export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  // ... handle event
}
```

## Subscription Status Validation

Check subscription status **server-side on every protected request** using your database (kept in sync via webhooks). Do not rely on:
- A cached session value from login time
- A client-side flag
- A JWT claim that was set at token creation and never refreshed

Subscriptions can be cancelled, expire, or change tier at any time. Your database (updated via webhooks) is the source of truth.

## Checkout Session Metadata

Validate that checkout session metadata (user ID, plan, etc.) was set **server-side** when creating the session, not passed from the client. If metadata comes from the client, an attacker can claim to be a different user or select a different plan.

## Race Conditions: Spending Twice

Checking a balance and then updating it in two steps lets two parallel requests both pass the check. Attackers send 20 requests at once to redeem a coupon 20 times or spend the same credits twice.

```typescript
// BAD: read, check, then write
const user = await db.users.findUnique({ where: { id } });
if (user.credits < 1) throw new Error('No credits');
await db.users.update({ where: { id }, data: { credits: user.credits - 1 } });

// GOOD: one atomic, conditional update
const result = await db.users.updateMany({
  where: { id, credits: { gte: 1 } },
  data: { credits: { decrement: 1 } },
});
if (result.count === 0) throw new Error('No credits');
```

For one-time things (coupons, trials, referral bonuses), let the database enforce it with a unique constraint, e.g. on `(user_id, coupon_id)` in a redemptions table.

## Webhook Retries and Other Providers

- Providers deliver the same event more than once. Store each `event.id` and skip ones already handled, or a retried `checkout.session.completed` grants the purchase twice.
- Every webhook needs its signature verified, not only Stripe's: use the provider's verifier (Svix for Clerk and others, `@octokit/webhooks` for GitHub), on the raw body. Verifiers that check a timestamp also stop old requests from being replayed.
