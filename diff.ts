import { defaultExtensions, ignoreLineComments } from './config.ts'
import { walk } from './deps.ts'
import { registries } from './registries/mod.ts'

const urlRegex = /(https?:\/\/[^\s]+[\d\w])/g

interface DiffOptions {
  dir: string
  extensions: string[]
}

export async function diff(fnOptions: Partial<DiffOptions>) {
  const options = {
    dir: fnOptions.dir ?? Deno.cwd(),
    extensions: fnOptions.extensions ?? defaultExtensions,
  }
  const matches: {
    registry: typeof registries[number]
    path: string
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
      if (ignoreLineComments.some((v) => line.includes(v))) {
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
            const column = line.indexOf(url)
            matches.push({
              registry,
              path,
              line: l + 1,
              column: column + 1,
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
    registry: typeof registries[number]
    package: string
    currentVersion: string | null
    latestVersion?: string
    url: string
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
      registry: registry,
      package: name,
      currentVersion,
      latestVersion,
      url,
      line: match.line,
      column: match.column,
      path: match.path,
    })
  }

  return result
}
