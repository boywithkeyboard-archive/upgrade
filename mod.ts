import { brightBlue, brightGreen, gray, italic, strikethrough, white } from 'https://deno.land/std@0.191.0/fmt/colors.ts'
import { walk } from 'https://deno.land/std@0.191.0/fs/walk.ts'
import { valid } from 'https://deno.land/std@0.191.0/semver/mod.ts'
import regex from 'https://esm.sh/url-regex@5.0.0'
import js_delivr from './registries/cdn.jsdelivr.net.ts'
import denoland_std from './registries/deno.land_std.ts'
import denoland_x from './registries/deno.land_x.ts'
import esm_sh from './registries/esm.sh.ts'
import github from './registries/raw.githubusercontent.com.ts'
import { Upgrade } from './createMarkdown.ts'

export default async function upgrade({
  directory = Deno.cwd(),
  extensions = ['.js', '.ts', '.json', '.md']
}: {
  directory?: string,
  extensions?: string[]
} = {}) {
  const cache = new Map<string, string>()

  , registries = [
    js_delivr,
    denoland_std,
    denoland_x,
    esm_sh,
    github
  ]

  , upgrades: Upgrade[] = []

  // walk through files
  for await (const { path, isFile } of walk(directory)) {
    if (!isFile || !extensions.some(e => path.endsWith(e)))
      continue

    let content = await Deno.readTextFile(path)

    const urlMatches = content.match(regex())

    if (!urlMatches)
      continue
    
    // walk through urls
    for (let url of urlMatches) {
      url = url.replace('\'', '').replace(')', '')

      if (
        url.includes('${') ||
        registries.some(r => url === `https://${r.prefix}`)
      )
        continue

      const registry = registries.filter(r => url.startsWith(`https://${r.prefix}`))[0]

      if (!registry)
        continue

      url = url.replace('https://', '')

      const name = await registry.getName(url)
      , fromVersion = await registry.getCurrentVersion(url)

      if (!valid(fromVersion))
        continue

      const toVersion = cache.get(`${registry.name}:${name}`)
        ?? await registry.getNextVersion(name, url)

      if (!cache.has(`${registry.name}:${name}`))
        cache.set(`${registry.name}:${name}`, toVersion)

      if (
        fromVersion.replace('v', '') === toVersion.replace('v', '') ||
        toVersion.includes('rc') ||
        toVersion.includes('alpha') ||
        toVersion.includes('beta') ||
        toVersion.includes('unstable') ||
        toVersion.includes('canary') ||
        toVersion.includes('nightly') ||
        toVersion.includes('dev')
      ) {
        console.info(gray(`${white(name)} × ${toVersion} ${italic(brightBlue('(skipped)'))}\n`))
  
        continue
      }

      // update url
      content = content.replace(url, url.replace(fromVersion, toVersion))

      upgrades.push({
        registry: registry.name,
        package: await registry.getName(url),
        fromVersion,
        toVersion,
        url,
        fileCount: 1,
        file: path
      })

      console.info(gray(`${white(name)} × ${strikethrough(fromVersion)} → ${brightGreen(toVersion)}\n`))
    }

    await Deno.writeTextFile(path, content)
  }

  return { upgrades }
}

if (import.meta.main)
  upgrade()
