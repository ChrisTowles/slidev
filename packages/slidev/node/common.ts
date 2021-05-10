import { promises as fs, existsSync } from 'fs'
import { join } from 'path'
import { uniq } from '@antfu/utils'
import { ResolvedSlidevOptions } from './options'
import { toAtFS } from './utils'

export async function getIndexHtml({ clientRoot, themeRoots, data, userRoot }: ResolvedSlidevOptions): Promise<string> {
  let main = await fs.readFile(join(clientRoot, 'index.html'), 'utf-8')
  let head = ''
  let body = ''

  const roots = uniq([
    ...themeRoots,
    userRoot,
  ])

  for (const root of roots) {
    const path = join(root, 'index.html')
    if (!existsSync(path))
      continue

    const index = await fs.readFile(path, 'utf-8')

    head += `\n${(index.match(/<head>([\s\S]*?)<\/head>/im)?.[1] || '').trim()}`
    body += `\n${(index.match(/<body>([\s\S]*?)<\/body>/im)?.[1] || '').trim()}`
  }

  if (data.features.katex)
    head += '\n<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">'

  if (data.features.tweet)
    body += '\n<script src="https://platform.twitter.com/widgets.js"></script>'

  main = main
    .replace('__ENTRY__', toAtFS(join(clientRoot, 'main.ts')))
    .replace('<!-- head -->', head)
    .replace('<!-- body -->', body)

  return main
}
