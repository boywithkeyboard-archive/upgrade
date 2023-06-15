import { parse } from 'https://deno.land/std@0.191.0/flags/mod.ts'
import {
  brightBlue,
  brightGreen,
  brightRed,
  gray,
  strikethrough,
  underline,
  white,
} from 'https://deno.land/std@0.191.0/fmt/colors.ts'
import { walk } from 'https://deno.land/std@0.191.0/fs/walk.ts'
import { difference, valid } from 'https://deno.land/std@0.191.0/semver/mod.ts'
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
  currentVersion: string
  nextVersion: string
  url: string
  fileCount: number
}

export default async function upgrade({
  allowBreaking = false,
  allowUnstable = false,
  dir = Deno.cwd(),
  ext = ['js', 'jsx', 'ts', 'tsx', 'json', 'md'],
}: {
  allowBreaking?: boolean
  allowUnstable?: boolean
  dir?: string
  ext?: string[]
} = {}) {
  const cache = new Map<string, string>()

  const registries = [
    js_delivr,
    denoland_std,
    denoland_x,
    esm_sh,
    github,
  ]

  const upgrades: Upgrade[] = []

  const list: Record<
    string,
    {
      upgraded: number
      failed: number
      skipped: number
      currentVersion?: string
      nextVersion?: string
    }
  > = {}

  // walk through files
  for await (const { path, isFile } of walk(dir)) {
    if (!isFile || !ext.some((e) => path.endsWith(`.${e}`))) {
      continue
    }

    let content = await Deno.readTextFile(path)

    const urlMatches = content.match(regex())

    if (!urlMatches) {
      continue
    }

    // walk through urls
    for (let url of urlMatches) {
      try {
        url = url.replace('\'', '').replace(')', '')

        if (
          url.includes('${') ||
          registries.some((r) => url === `https://${r.prefix}`)
        ) {
          continue
        }

        url = url.replace('\'', '').replace(')', '')

        if (
          url.includes('${') ||
          registries.some((r) => url === `https://${r.prefix}`)
        ) {
          continue
        }

        const registry = registries.filter((r) =>
          url.startsWith(`https://${r.prefix}`)
        )[0]

        if (!registry) {
          continue
        }

        url = url.replace('https://', '')

        const name = await registry.getName(url)
        const currentVersion = await registry.getCurrentVersion(url)

        if (!valid(currentVersion)) {
          continue
        }

        let nextVersion: string

        try {
          nextVersion = cache.get(`${registry.name}:${name}`) ??
            await registry.getNextVersion(name, url)
        } catch (_) {
          throw new Error(
            `ferr${
              JSON.stringify({ name, registry: registry.name, currentVersion })
            }`,
          )
        }

        if (!cache.has(`${registry.name}:${name}`)) {
          cache.set(`${registry.name}:${name}`, nextVersion)
        }

        const diff = difference(currentVersion, nextVersion)

        if (
          diff === null || // same version
          !allowBreaking && diff === 'major' || // breaking
          !allowUnstable && diff === 'prerelease' // unstable
        ) {
          if (list[`${registry.name}:${name}`] !== undefined) {
            list[`${registry.name}:${name}`].skipped++
          } else {
            list[`${registry.name}:${name}`] = {
              upgraded: 0,
              skipped: 1,
              failed: 0,
              currentVersion,
            }
          }

          continue
        }

        // update url
        content = content.replace(url, url.replace(currentVersion, nextVersion))

        upgrades.push({
          registry: registry.name,
          package: await registry.getName(url),
          currentVersion,
          nextVersion,
          url,
          fileCount: 1,
          file: path,
        })

        if (list[`${registry.name}:${name}`] !== undefined) {
          list[`${registry.name}:${name}`].upgraded++
        } else {
          list[`${registry.name}:${name}`] = {
            upgraded: 1,
            skipped: 0,
            failed: 0,
            currentVersion,
            nextVersion,
          }
        }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('ferr')) {
          const data = JSON.parse(err.message.replace('ferr', ''))

          if (list[`${data.registry}:${data.name}`] !== undefined) {
            list[`${data.registry}:${data.name}`].upgraded++
          } else {
            list[`${data.registry}:${data.name}`] = {
              upgraded: 0,
              skipped: 0,
              failed: 1,
            }
          }
        }
      }
    }

    await Deno.writeTextFile(path, content)
  }

  let logString = `${underline('upgrade')}\n\n`

  for (const [key, value] of Object.entries(list)) {
    if (value.nextVersion && value.currentVersion) {
      logString += `${white(key.split(':')[1])} × ${
        strikethrough(value.currentVersion)
      } → ${brightGreen(value.nextVersion)}\n`
    } else {
      logString += `${white(key.split(':')[1])} × ${
        value.currentVersion ? value.currentVersion : '?.?.?'
      } ${
        value.skipped > 0 ? brightBlue('(skipped)') : brightRed('(failed)')
      }\n`
    }
  }

  console.info(gray(logString))

  return { upgrades }
}

if (import.meta.main) {
  const args = parse(Deno.args)

  const dir = args.d ?? args.dir
  const ext = args.e ?? args.ext
  const allowBreaking = args.b ?? args['allow-breaking']
  const allowUnstable = args.u ?? args['allow-unstable']

  upgrade({
    ...(typeof dir === 'string' && { dir }),
    ...(typeof ext === 'string' && { ext: ext.split(',') }),
    allowBreaking: typeof allowBreaking === 'boolean' ? allowBreaking : false,
    allowUnstable: typeof allowUnstable === 'boolean' ? allowUnstable : false,
  })
}
