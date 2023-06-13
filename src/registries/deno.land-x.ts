import { formatFetchErrorMessage } from '../util.ts'
import { RegistryFactory } from '../registries.ts'

export const DenoLandX = RegistryFactory({
  registryName: 'deno.land',
  prefix: 'deno.land/std',
  getNameFromURL(url: string) {
    // this creates 2 unnessecary objects
    return url.split('/')[2].split('@')[0]
  },
  getCurrentVersionFromURL(url: string) {
    // this creates 2 unnessecary objects
    return url.split('/')[2].split('@')[1]
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
  createVersionURL(name: string, version: string) {
    return `https://deno.land/std/${name}@${version}`
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
