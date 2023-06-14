import { RegistryFactory } from '../registries.ts'
import { formatFetchErrorMessage } from '../util.ts'

export const JSDeliverGH = RegistryFactory({
  registryName: 'cdn.jsdelivr.net',
  prefix: 'cdn.jsdelivr.net/gh',
  getNameFromURL(url: string) {
    return url.split('/')[2] + '/' + url.split('/')[3]
  },
  getCurrentVersionFromURL(url: string) {
    const scopedPackage = url.split('/')[2].split('@')[0].length === 0
    if (scopedPackage) {
      return url.split('/')[3].split('@')[1]
    }
    return url.split('/')[2].split('@')[1]
  },
  async getVersions(name: string) {
    const res = await fetch(`https://api.github.com/repos/${name}/releases`)

    if (!res.ok) {
      throw new Error(
        formatFetchErrorMessage(`cdn.jsdelivr.net ${name} fetch error`, res),
      )
    }

    return (await res.json())[0].tag_name
  },
  createVersionURL(name: string, version: string | null) {
    return `https://github.com/${name}/releases/tag/${version}`
  },
  // deno-lint-ignore require-await
  async getRepository(name: string) {
    return `https://github.com/${name}`
  },
})
