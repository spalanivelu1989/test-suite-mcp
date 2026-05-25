## Publishing to npm

### One-time setup

1. Create an account at [npmjs.com](https://www.npmjs.com) if you don't have one.
2. Log in from the terminal:
   ```bash
   npm login
   ```
3. Update the `repository.url` in `package.json` to the real GitHub URL.

### Publish

From the repo root:

```bash
npm publish
```

`prepublishOnly` runs `npm run build` automatically before publishing, so no
manual build step is needed. The package name `test-suite-mcp` must be unique
on npm — if it's already taken, use a scoped name instead:

```bash
# rename in package.json first, then:
npm publish --access public
```

### Using the published package

Users can then configure any MCP client with:

```json
{
  "mcpServers": {
    "test-suite": {
      "command": "npx",
      "args": ["-y", "test-suite-mcp@latest"],
    }
  }
}
```
### Publish a new version

```bash
npm version patch   # or minor / major
npm publish
```
