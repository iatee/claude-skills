# Authentication & Authorization

## JWT Handling

- **Use `jwt.verify()`, never `jwt.decode()` alone.** `decode` reads the payload without checking the signature — an attacker can forge any payload.
- **Explicitly reject `"alg": "none"`.** Some JWT libraries accept unsigned tokens if the algorithm is set to `"none"`. Your verification must reject this.
- **Validate issuer, audience, and expiration** — not just the signature.

```typescript
// BAD: reads token without verifying signature
const payload = jwt.decode(token);

// GOOD: verifies signature, rejects tampered tokens
const payload = jwt.verify(token, secret, {
  algorithms: ['HS256'],
  issuer: 'your-app',
});
```

## Next.js Middleware Is Not Enough

Next.js middleware runs at the edge and is convenient for auth checks, but it is **not a reliable sole auth layer**. CVE-2025-29927 demonstrated that middleware could be completely bypassed via a spoofed `x-middleware-subrequest` header.

Always verify auth again in:
- Server Actions
- Route Handlers (`app/api/`)
- Data access functions / database queries

Middleware should be a convenience layer, not the only wall between an attacker and your data.

## Server Actions Are Public Endpoints

Server Actions compile into public POST endpoints. Anyone can call them with `curl`. AI assistants frequently generate Server Actions that assume they're only called by the UI:

```typescript
// BAD: no auth check, no input validation
'use server';
export async function deleteItem(id: string) {
  await db.items.delete({ where: { id } });
}

// GOOD: validates input, authenticates, and authorizes
'use server';
export async function deleteItem(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid input' };

  const session = await auth();
  if (!session?.user) redirect('/login');

  // Authorize: verify ownership, not just login
  await db.items.deleteMany({
    where: { id: parsed.data.id, userId: session.user.id }
  });
}
```

Every Server Action needs three things at the top:
1. **Input validation** (Zod or similar runtime schema)
2. **Authentication** (verify the user is logged in)
3. **Authorization** (verify the user owns the resource)

## API Route Handlers

Same rules apply to `app/api/` route handlers. Every route handler is a public endpoint. Authenticate and authorize at the top of every handler.

### Admin, Cron and Internal Routes

A route nobody links to is still public. AI assistants often leave `/api/admin/*`, `/api/cron/*`, `/api/seed` or debug routes open "for now".

- Admin routes: check the user's role on the server, from the database or a verified session claim. Never trust a role sent in the request, and hiding the admin page in the UI protects nothing.
- Cron jobs and internal endpoints: require a secret. On Vercel, set `CRON_SECRET` and Vercel sends it as `Authorization: Bearer <secret>`; compare it in constant time (see "Generating and Comparing Secrets").
- Remove seed, test and debug routes before launch, or have them return 404 in production.

## Data Leakage to Client Components

Never pass entire database objects to Client Components. They may contain sensitive fields (hashed passwords, internal IDs, admin flags). Select only the fields the client needs:

```typescript
// BAD: leaks all fields to the client
const user = await db.users.findUnique({ where: { id } });
return <UserProfile user={user} />;

// GOOD: select only needed fields
const user = await db.users.findUnique({
  where: { id },
  select: { name: true, avatarUrl: true }
});
return <UserProfile user={user} />;
```

Use `import 'server-only'` at the top of data access modules to prevent them from being accidentally imported into Client Components.

## Session & Token Storage

- Store tokens in `HttpOnly + Secure + SameSite=Lax` cookies, **not localStorage**.
- localStorage is accessible to any JavaScript on the page — a single XSS vulnerability exposes all tokens.
- `HttpOnly` cookies are invisible to JavaScript and sent automatically by the browser.

## Generating and Comparing Secrets

- **Never use `Math.random()`** (or Python's `random`) for tokens, reset links, invite codes, API keys or session IDs. It is predictable. Use `crypto.randomBytes(32).toString('hex')`, `crypto.randomUUID()`, or Python's `secrets.token_urlsafe(32)`.
- **Compare secrets in constant time.** `===` returns as soon as a character differs, which leaks how much of a guess was right. Use `crypto.timingSafeEqual` (check that both buffers have the same length first, it throws otherwise) or Python's `hmac.compare_digest`.

## Password Reset

- Reset tokens are random (see above), single-use, expire within an hour, and are stored hashed, like passwords.
- Respond the same way whether or not the email has an account ("If that address has an account, we sent a link"), so the form can't be used to find out who has an account.
- After a reset, end the user's other sessions.

## OAuth / Social Login

- Send and verify the `state` parameter; without it an attacker can log a victim into the attacker's account. Use PKCE for mobile and single-page apps.
- Register exact redirect URIs with the provider; no wildcards.
- Don't link a social login to an existing account by email unless the provider says the email is verified, or anyone who can create a provider account with your user's address can take over theirs.

## Open Redirects

After login, apps often send users back to `?next=` or `?redirect=`. Using that value as is lets an attacker send a link to your real login page that ends on their phishing site.

```typescript
// ❌ Any URL
redirect(searchParams.get('next') ?? '/');

// ✅ Only paths on this site. Parse it as the browser would: "//evil.com", "/\evil.com"
// and "/\t/evil.com" all lead to other sites, which a startsWith('/') check misses.
const base = 'https://app.invalid'; // any fixed origin; only used for the comparison
const target = new URL(searchParams.get('next') ?? '/', base);
redirect(target.origin === base ? target.pathname + target.search + target.hash : '/');
```

The same goes for logout, email links and anywhere else a redirect target comes from the request.

## CSRF

With cookie sessions, the browser sends the cookie even when another site triggers the request.

- Set session cookies to `SameSite=Lax` (or `Strict`). `SameSite=None` needs a CSRF token.
- Never change data on a GET request. `Lax` cookies are still sent when a link is followed, so `GET /api/account/delete` can be triggered from any page.
- Next.js Server Actions only accept POST and compare the `Origin` header with the host. Behind a proxy or another domain, list the allowed origins in `serverActions.allowedOrigins` rather than turning the check off.
- Route handlers and other backends that use cookie sessions: check the `Origin` header on POST, PUT, PATCH and DELETE, or use a CSRF token.
- Tokens sent in an `Authorization` header aren't attached automatically, so they aren't affected.
