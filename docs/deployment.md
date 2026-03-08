# Deployment Notes

This app is intended to be deployed as static files.

## Deployment Model

- `next.config.ts` sets `output: 'export'`
- `pnpm build` generates static assets into `out/`
- Gameplay is fully client-side after the page loads
- No server runtime, database, secrets, or API keys are required

## Build

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Run the production build:

```bash
pnpm build
```

The deployable artifact is the `out/` directory.

## Local Preview Of The Production Build

Serve the exported files locally:

```bash
pnpm start
```

That runs `serve out`.

## What To Upload

Upload the contents of `out/` to any static host, or configure the host to publish that directory directly.

Suitable targets:

- Vercel static deployment
- Netlify
- Cloudflare Pages
- GitHub Pages
- S3 + CloudFront
- Any CDN or web server that can serve static files

## Host Requirements

- Serve `index.html` and static assets from `out/`
- Gzip or Brotli is recommended but not required
- Cache hashed `/_next/static/*` assets aggressively
- Do not rewrite gameplay requests to a backend

## Notes For Specific Hosts

### Vercel

- Build command: `pnpm build`
- Output directory: `out`

### Netlify

- Build command: `pnpm build`
- Publish directory: `out`

### Cloudflare Pages

- Build command: `pnpm build`
- Build output directory: `out`

### GitHub Pages

- Publish the `out/` contents
- If you deploy under a subpath instead of the domain root, you will need to add `basePath` and `assetPrefix` in `next.config.ts`

## CI Recommendation

A minimal pipeline is:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

If you also want browser coverage in CI:

```bash
pnpm test:e2e
```

## Dataset Refresh Workflow

Deployment does not need network access to source APIs. Only the snapshot rebuild step does.

When refreshing the dataset:

```bash
pnpm build:data
pnpm validate:data
pnpm test
pnpm build
```

Commit the updated `data/generated/*` files before deploying.
