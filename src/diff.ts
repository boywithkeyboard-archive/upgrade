import {
  extensions as defaultExtensions,
  ignoreLineComment,
} from './options.ts'
import { walk } from './deps.ts'
import * as registryList from './registries/mod.ts'

const urlRegex = /(https?:\/\/[^\s]+[\d\w])/g

interface DiffOptions {
  dir: string
  extensions: string[]
}

interface Upgrade {
  registry: string
  package: string
  file: string
  fromVersion: string
  toVersion: string
  url: string
  fileCount: number
}

interface Listed {
  upgraded: number
  failed: number
  skipped: number
  fromVersion?: string
  toVersion?: string
}

export async function diff(options: DiffOptions = {
  dir: Deno.cwd(),
  extensions: defaultExtensions,
}) {
  const registries = Object.values(registryList)
  const matches: {
    registry: typeof registries[number]
    path: string
    bytePos: number
    line: number
    column: number
    url: string
  }[] = []
  const fetches = new Map<string, Promise<string>>()
  for await (const { path, isFile } of walk(options.dir)) {
    if (!isFile || !options.extensions.some((v) => path.endsWith(`.${v}`))) {
      continue
    }
    const content = await Deno.readTextFile(path)
    const lines = content.split('\n')
    for (let l = 0; l < lines.length; l++) {
      const line = lines[l]
      if (line.includes(ignoreLineComment)) {
        l++
        continue
      }
      const urls = line.match(urlRegex)
      if (!urls) {
        continue
      }
      for (const url of urls) {
        if (url.includes('${')) {
          break
        }
        for (const registry of registries) {
          if (url.startsWith('https://' + registry.prefix)) {
            const bytePos = content.indexOf(url)
            const column = line.indexOf(url)
            matches.push({
              registry,
              path,
              bytePos,
              line: l + 1,
              column,
              url,
            })
          }
        }
      }
    }
  }

  for (const match of matches) {
    const { registry, url } = match
    const name = registry.getNameFromURL(url)
    if (fetches.has(url)) {
      continue
    }
    fetches.set(url, registry.getLatestVersion(name))
  }

  await Promise.all(fetches.values())

  const result: {
    registry: string
    package: string
    currentVersion: string | null
    latestVersion?: string
    url: string
    bytePos: number
    line: number
    column: number
    path: string
  }[] = []

  for (const match of matches) {
    const { registry, url } = match
    const name = registry.getNameFromURL(url)
    const currentVersion = registry.getCurrentVersionFromURL(url)
    const latestVersion = await fetches.get(url)
    result.push({
      registry: registry.registryName,
      package: name,
      currentVersion,
      latestVersion,
      url,
      bytePos: match.bytePos,
      line: match.line,
      column: match.column,
      path: match.path,
    })
  }

  return result
}
