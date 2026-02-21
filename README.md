# scraps

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

Environment variables
- **DISCORD_WEBHOOK_URL**: (optional) Discord webhook URL used to send notifications.
- **SESSION_COOKIE**: session token for api.scraps.hackclub.com. Provide the raw session value (do not include `session=`). `index.ts` will build the full cookie header.

Example
- Copy [.env.example](.env.example) to `.env` and fill in values.

Run examples
- PowerShell (one-liner to set env and run):

```powershell
$env:DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...' ; $env:SESSION_COOKIE='your_session_cookie' ; bun run index.ts
```

- Bash / CMD (inline env):

```bash
DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...' SESSION_COOKIE='your_session_cookie' bun run index.ts
```

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
