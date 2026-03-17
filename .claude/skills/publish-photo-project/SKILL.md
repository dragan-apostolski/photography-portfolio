---
name: publish-photo-project
description: Run the full photo processing pipeline for a photography project — analyze, upload to Cloudflare R2, generate markdown, edit metadata, and verify locally. Use when the user wants to add, upload, or publish a new photo project.
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
argument-hint: [Project Name]
---

# Publish Photo Project Pipeline

You are running the full photo processing pipeline to publish a photography project. The project name is: **$ARGUMENTS**

Follow these steps in order. Stop and report to the user if any step fails.

## Step 1: Verify Photos Exist

Check that photos exist in `original-photos/Projects/$ARGUMENTS/`. List the files found (only `.jpg`/`.jpeg` files count). If the folder doesn't exist or has no photos, stop and tell the user.

## Step 2: Analyze Photos

Run the analysis to check photo sizes:

```bash
npm run analyze-photos
```

Report the results — how many photos, how many need compression (>3MB), total size.

## Step 3: Upload Photos to Cloudflare R2

First do a dry run and show the user what will be uploaded:

```bash
npm run upload-photos -- --folder="$ARGUMENTS" --dry-run
```

Then ask the user for confirmation before running the real upload:

```bash
npm run upload-photos -- --folder="$ARGUMENTS"
```

If photos already exist and the user wants to re-upload, add `--overwrite`.

Report the upload summary (uploaded count, compression savings, any failures).

## Step 4: Generate Markdown

Run the markdown generator to create/update the project content file:

```bash
npm run update-markdown
```

This creates `content/projects/<slug>.md` from the upload manifest. Report which file was created or updated.

## Step 5: Edit Project Metadata

Read the generated markdown file in `content/projects/`. The auto-generated metadata will have placeholder values. Ask the user to provide:

- **title** — project display name
- **description** — short project description
- **location** — where the photos were taken (format: "City, Country")
- **date** — when the photos were taken (YYYY-MM-DD). Use `startDate`/`endDate` for ranges
- **tags** — from the existing tag vocabulary: travel, portrait, landscape, event, adventure, art, baby, client, couple, experimental, family, hospitality, music, nature, outdoor, studio, urban
- **coverPhoto** — which photo to use as the desktop cover (default is first photo)
- **coverPhotoMobile** — which photo to use as the mobile cover (default is second photo, should ideally be vertical)
- **photo order** — whether the current alphabetical order is correct, or if photos should be reordered

Apply the user's metadata edits to the markdown file.

## Step 6: Verify Locally

Start the dev server and tell the user to check the project:

```bash
npm run dev
```

Tell the user to navigate to:
- `/projects` — verify the project appears in the grid
- `/projects/<slug>` — verify the project page looks correct (cover photo, metadata, photo gallery)
- `/` — verify the homepage carousel if this is a recent project

Ask the user if everything looks good or if adjustments are needed.

## Step 7: Ready to Deploy

Once the user confirms everything looks good, remind them that:
- The new/updated file is `content/projects/<slug>.md`
- They should commit and push to trigger a Vercel deployment
- **Do NOT commit or push without explicit permission**

Ask if they'd like you to prepare a commit.

## Important Notes

- Photos are served from Cloudflare R2 CDN via `NUXT_PUBLIC_CDN_BASE_URL`
- The `original-photos/` directory and `scripts/manifests/` are gitignored — never commit these
- Photo paths in markdown are relative to CDN: `/photos/Projects/<Project Name>/<filename>`
- Aspect ratio is auto-detected (vertical, horizontal, square) with ±0.1 threshold around 1:1
- Only `.jpg`/`.jpeg` files are supported
