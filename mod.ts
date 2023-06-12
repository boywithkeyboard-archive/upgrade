import { brightBlue, brightGreen, brightRed, gray, strikethrough, underline, white } from 'https://deno.land/std@0.191.0/fmt/colors.ts'
import { walk } from 'https://deno.land/std@0.191.0/fs/walk.ts'
import { valid } from 'https://deno.land/std@0.191.0/semver/mod.ts'
import regex from 'https://esm.sh/url-regex@5.0.0'
import js_delivr from './registries/cdn.jsdelivr.net.ts'
import denoland_std from './registries/deno.land_std.ts'
import denoland_x from './registries/deno.land_x.ts'
import esm_sh from './registries/esm.sh.ts'
import github from './registries/raw.githubusercontent.com.ts'

type Upgrade = {
  registry: string
  package: string
  file: string
  fromVersion: string
  toVersion: string
  url: string
  fileCount: number
}

export default async function upgrade({
  directory = Deno.cwd(),
  ext = ['js', 'ts', 'json', 'md']
}: {
  directory?: string,
  ext?: string[]
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

  , list: Record<string, { upgraded: number, failed: number, skipped: number, fromVersion?: string, toVersion?: string }> = {}

  // walk through files
  for await (const { path, isFile } of walk(directory)) {
    if (!isFile || !ext.some(e => path.endsWith(`.${e}`)))
      continue

    let content = await Deno.readTextFile(path)

    const urlMatches = content.match(regex())

    if (!urlMatches)
      continue
    
    // walk through urls
    for (let url of urlMatches) {
      try {
        url = url.replace('\'', '').replace(')', '')

        if (
          url.includes('${') ||
          registries.some(r => url === `https://${r.prefix}`)
        )
          continue

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
  
        let toVersion: string
  
        try {
          toVersion = cache.get(`${registry.name}:${name}`)
          ?? await registry.getNextVersion(name, url)
        } catch (_) {
          throw new Error(`ferr${JSON.stringify({ name, registry: registry.name, fromVersion })}`)
        }
  
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
          if (list[`${registry.name}:${name}`] !== undefined)
            list[`${registry.name}:${name}`].skipped++
          else
            list[`${registry.name}:${name}`] = { upgraded: 0, skipped: 1, failed: 0, fromVersion }
    
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

        if (list[`${registry.name}:${name}`] !== undefined)
          list[`${registry.name}:${name}`].upgraded++
        else
          list[`${registry.name}:${name}`] = { upgraded: 1, skipped: 0, failed: 0, fromVersion, toVersion }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('ferr')) {
          const data = JSON.parse(err.message.replace('ferr', ''))
  
          if (list[`${data.registry}:${data.name}`] !== undefined)
            list[`${data.registry}:${data.name}`].upgraded++
          else
            list[`${data.registry}:${data.name}`] = { upgraded: 0, skipped: 0, failed: 1 }
        }
      }
    }

    await Deno.writeTextFile(path, content)
  }

  let logString = `${underline('upgrade')}\n\n`

  for (const [key, value] of Object.entries(list)) {
    if (value.toVersion && value.fromVersion) {
      logString += `${white(key.split(':')[1])} × ${strikethrough(value.fromVersion)} → ${brightGreen(value.toVersion)} (${brightGreen(`${value.upgraded} ✓`)}, ${brightBlue(`${value.skipped} ⁄`)}, ${brightRed(`${value.failed} ✗`)} failed)\n`
    } else {
      logString += `${white(key.split(':')[1])} × ${value.fromVersion ? value.fromVersion : '?.?.?'} (${brightGreen(`${value.upgraded} ✓`)}, ${brightBlue(`${value.skipped} ⁄`)}, ${brightRed(`${value.failed} ✗`)})\n`
    }
  }

  console.info(gray(logString))

  return { upgrades }
}

if (import.meta.main)
  upgrade()
