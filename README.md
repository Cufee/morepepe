# morepepe

Static directory of 748 Pepe & friends emojis for Slack and Discord.

Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [Fuse.js](https://www.fusejs.io/).
Hosted on [Cloudflare Pages](https://pages.cloudflare.com).

## Setup

```sh
npm install
```

## Development

```sh
npm run dev
```

## Build

```sh
npm run build    # runs prepare script + astro build
npm run preview  # preview the built site locally
```

The build script (`scripts/prepare.js`) processes the manifest, deduplicates entries, generates slugs, computes related emojis, creates a zip archive, and outputs the search index.

## Lint & Format

```sh
npm run lint       # check
npm run lint:fix   # auto-fix
npm run format     # format all files
```

## Adding emojis

1. Add image files to `public/emojis/`
2. Add entries to `public/emojis/manifest.json` with `name`, `description`, `tags`, `width`, `height`, and `fileType
3. Rebuild

## Deploy

Hosted on Cloudflare Pages. Configure these settings in the dashboard under **Workers & Pages > morepepe > Settings > Build & deployments**:

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Deploy command (production)**: `npx wrangler pages deploy dist --project-name=morepepe`
- **Deploy command (preview)**: `npx wrangler pages deploy dist --project-name=morepepe --branch=dev`
