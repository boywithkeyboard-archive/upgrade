import { formatFetchErrorMessage } from '../util.ts'
import { RegistryFactory } from '../registries.ts'

export const DenoLandX = RegistryFactory({
  registryName: 'deno.land',
  prefix: 'deno.land/x',
  getNameFromURL(url: string) {
    // this creates 2 unnessecary objects
    if (url.includes('@')) {
      return url.split('/')[4].split('@')[0]
    }
    return url.split('/')[4]
  },
  getCurrentVersionFromURL(url: string) {
    // this creates 2 unnessecary objects
    if (url.includes('@')) {
      return url.split('/')[4].split('@')[1]
    }
    return null
  },
  async getVersions(name: string) {
    const res = await fetch(`https://apiland.deno.dev/v2/modules/${name}`)
    if (!res.ok) {
      throw new Error(
        formatFetchErrorMessage(`deno.land/x ${name} module fetch error`, res),
      )
    }
    const json = await res.json() as { versions: string[] }
    return json.versions
  },
  createVersionURL(name: string, version: string | null) {
    if (version === null) return `https://deno.land/x/${name}`
    return `https://deno.land/x/${name}@${version}`
  },
  async getRepository(name: string) {
    const res = await fetch(
      `https://apiland.deno.dev/v2/metrics/modules/${name}`,
    )
    if (!res.ok) {
      throw new Error(
        formatFetchErrorMessage(
          `deno.land/x ${name} repository fetch error`,
          res,
        ),
      )
    }
    const json = await res.json() as {
      info: { upload_options: { repository: string } }
    }
    return `https://github.com/${json.info.upload_options.repository}`
  },
})
