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

1. Add image files to `assets/`
2. Add entries to `assets/manifest.json` with `name`, `description`, `tags`, `fileSize`, `fileSizeHuman`, `width`, `height`, and `fileType`
3. Rebuild

## Deploy

Connect the repo to Cloudflare Pages:

- Build command: `npm run build`
- Output directory: `dist`
