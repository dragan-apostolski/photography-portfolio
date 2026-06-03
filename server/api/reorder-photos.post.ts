import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * Dev-only endpoint that rewrites the order of the `photos:` list in a
 * project's markdown frontmatter. The markdown file is the source of truth for
 * photo order, so this is what the local reorder editor persists to.
 *
 * It reorders the existing YAML list items in place (matching by `fileName`)
 * without reserializing the rest of the frontmatter — every other field keeps
 * its exact original formatting, comments and quoting.
 */
export default defineEventHandler(async (event) => {
  // Never expose this outside local development — there is no admin auth.
  if (!import.meta.dev) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Editing is only available in development',
    })
  }

  const body = await readBody<{ slug?: string; order?: string[] }>(event)
  const slug = body?.slug
  const order = body?.order

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid project slug' })
  }
  if (!Array.isArray(order) || order.length === 0 || order.some((f) => typeof f !== 'string')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid photo order' })
  }

  const filePath = resolve(process.cwd(), 'content/projects', `${slug}.md`)

  let content: string
  try {
    content = await readFile(filePath, 'utf-8')
  } catch {
    throw createError({ statusCode: 404, statusMessage: `Project "${slug}" not found` })
  }

  const lines = content.split('\n')

  // Locate the frontmatter bounds (first two `---` fences).
  const firstFence = lines.findIndex((l) => l.trim() === '---')
  const closeFence = lines.findIndex((l, i) => i > firstFence && l.trim() === '---')
  if (firstFence !== 0 || closeFence === -1) {
    throw createError({ statusCode: 500, statusMessage: 'Could not parse project frontmatter' })
  }

  // Find the `photos:` key inside the frontmatter.
  const photosKey = lines.findIndex(
    (l, i) => i > firstFence && i < closeFence && /^photos:\s*$/.test(l)
  )
  if (photosKey === -1) {
    throw createError({ statusCode: 500, statusMessage: 'No photos list found in frontmatter' })
  }

  // Collect the list-item lines until the next top-level key or the closing fence.
  let blockEnd = photosKey + 1
  while (blockEnd < closeFence && /^\s/.test(lines[blockEnd])) {
    blockEnd++
  }

  // Group the indented lines into items. A new item starts at a `-` marker;
  // deeper-indented lines (e.g. aspectRatio, description) belong to it.
  const itemLines = lines.slice(photosKey + 1, blockEnd)
  const blocks: string[][] = []
  for (const line of itemLines) {
    if (/^\s*-\s/.test(line)) blocks.push([line])
    else if (blocks.length) blocks[blocks.length - 1].push(line)
  }

  // Map each block to its fileName for lookup.
  const byFileName = new Map<string, string[]>()
  for (const block of blocks) {
    const match = block.join('\n').match(/fileName:\s*['"]?([^'"\n]+?)['"]?\s*$/m)
    if (match) byFileName.set(match[1], block)
  }

  // Validate the requested order matches the file exactly (same set, same size).
  if (order.length !== blocks.length || !order.every((f) => byFileName.has(f))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Photo order does not match the photos in this project',
    })
  }

  const reordered = order.flatMap((fileName) => byFileName.get(fileName)!)

  const newLines = [...lines.slice(0, photosKey + 1), ...reordered, ...lines.slice(blockEnd)]
  await writeFile(filePath, newLines.join('\n'), 'utf-8')

  return { success: true, count: order.length }
})
