import { RegistryFactory } from './mod.ts'
import { formatFetchErrorMessage } from '../util.ts'

export const JSDeliverNPM = RegistryFactory({
  registryName: 'cdn.jsdelivr.net',
  prefix: 'cdn.jsdelivr.net/npm',
  getNameFromURL(url: string) {
    const packageName = url
      .split('/')[2]
      .split('@')[0]
    if (packageName.length > 0) {
      return packageName
    }
    return url.split('/')[2] + '/' + url.split('/')[3].split('@')[0]
  },
  getCurrentVersionFromURL(url: string) {
    const scopedPackage = url.split('/')[2].split('@')[0].length === 0
    if (scopedPackage) {
      return url.split('/')[3].split('@')[1]
    }
    return url.split('/')[2].split('@')[1]
  },
  async getVersions(name: string) {
    const res = await fetch(`https://registry.npmjs.org/${name}`)

    if (!res.ok) {
      throw new Error(
        formatFetchErrorMessage('npmjs.org versions fetch error', res),
      )
    }
    const json = await res.json() as { versions: Record<string, unknown> }
    return Object.keys(json.versions)
  },
  createVersionURL(name: string, version: string | null) {
    return `https://npmjs.com/package/${name}/v/${version}`
  },
  async getRepository(name: string) {
    const res = await fetch(`https://registry.npmjs.org/${name}`)

    if (!res.ok) {
      throw new Error(
        formatFetchErrorMessage('npmjs.org repository fetch error', res),
      )
    }
    const json = await res.json() as { repository: { url: string } }
    return json.repository.url.replace('git+', '').replace('.git', '')
  },
})
