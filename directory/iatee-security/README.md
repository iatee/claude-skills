# iatee-security

Find and prevent the security holes AI-written apps tend to have: leaked keys, open databases, missing auth checks, client-side prices. Skills by Chris Raroque and BehiSecc.

| Skill | What it does | When to use it |
|---|---|---|
| `vibe-security` | Audits an app for the holes AI assistants leave: exposed keys, open Supabase or Firebase tables, unchecked auth, client-set prices, missing rate limits. | You built an app with AI and want to know if someone could break in before you ship it. |
| `vibesec` | Makes Claude write web code the way a bug hunter would want it: no IDOR, XSS, CSRF, SSRF, open redirects or weak JWTs. | You're building any web app and want it secure from the first line, not fixed later. |

Part of [Claude Skills](https://skills.garciabaertsch.com), a curated collection of Claude Code skills. This is the directory edition of the `security` plugin. The full collection, including plugins with hooks and scripts such as the skill suggester, installs from its own marketplace:

```text
/plugin marketplace add https://github.com/iatee/claude-skills.git
```

## Credits

- [Chris Raroque](https://github.com/raroque/vibe-security-skill) (MIT)
- [BehiSecc](https://github.com/BehiSecc/VibeSec-Skill) (Apache-2.0)

Skills by other authors keep their license file in their folder.
