import { gte, lte, difference } from 'https://deno.land/std@0.191.0/semver/mod.ts'
import js_delivr from './registries/cdn.jsdelivr.net.ts'
import denoland_std from './registries/deno.land_std.ts'
import denoland_x from './registries/deno.land_x.ts'
import esm_sh from './registries/esm.sh.ts'
import github from './registries/raw.githubusercontent.com.ts'

export type Upgrade = {
  registry: string
  package: string
  file: string
  fromVersion: string
  toVersion: string
  url: string
  fileCount: number
}

export async function createMarkdown(upgrades: Upgrade[]) {
  let markdown = '**upgrade**\n'

  const sortedUpdates: Record<string, Upgrade[]> = {}

  , registries = [
    js_delivr,
    denoland_std,
    denoland_x,
    esm_sh,
    github
  ]

  for (const registry of registries)
    sortedUpdates[registry.name] = []

  for (const upgrade of upgrades)
    sortedUpdates[upgrade.registry].push(upgrade)

  // filter out duplicates
  for (const [key, updates] of Object.entries(sortedUpdates)) {
    const filteredUpdates: Upgrade[] = []

    for (const update of updates) {
      const exists = filteredUpdates.find(item => item.package === update.package && item.registry === update.registry)
      , existsIndex = filteredUpdates.findIndex(item => item.package === update.package && item.registry === update.registry)

      if (exists) {
        update.fileCount = exists.file === update.file ? filteredUpdates[existsIndex].fileCount : (filteredUpdates[existsIndex].fileCount + 1)
        update.fromVersion = gte(exists.fromVersion.replace('v', ''), update.fromVersion.replace('v', '')) ? update.fromVersion : exists.fromVersion // select the lowest version
        update.toVersion = lte(exists.toVersion.replace('v', ''), update.toVersion.replace('v', '')) ? update.toVersion : exists.toVersion // select the highest version

        filteredUpdates[existsIndex] = update
      } else {
        filteredUpdates.push(update)
      }
    }

    sortedUpdates[key] = filteredUpdates
  }

  // sort packages alphabetically
  for (const [key, value] of Object.entries(sortedUpdates))
    sortedUpdates[key] = value.sort((a, b) => a.package.localeCompare(b.package))

  // create markdown
  for (const [registryName, updates] of Object.entries(sortedUpdates)) {
    if (updates.length === 0)
      continue

    markdown += `\n- **${registryName}**\n\n`

    for (const update of updates) {
      const isBreaking = difference(update.fromVersion.replace('v', ''), update.toVersion.replace('v', '')) === 'major'

      try {
        const registry = registries.filter(registry => registry.name === update.registry)[(update.package !== 'std' && update.registry === 'deno.land') ? 1 : 0]

        markdown += `  - [**${update.package}**](${await registry.getRepository(update.package, update.url)}) × [\`${update.fromVersion}\`](${registry.getCurrentVersionUrl(update.package, update.fromVersion, update.url)}) → [\`${update.toVersion}\`](${registry.getNextVersionUrl(update.package, update.toVersion, update.url)}) *in ${update.fileCount} ${update.fileCount > 1 ? 'files' : 'file'}* ${isBreaking ? '**BREAKING UPGRADE**' : ''}\n`
      } catch (_err) {
        continue
      }
    }
  }

  return markdown
}
