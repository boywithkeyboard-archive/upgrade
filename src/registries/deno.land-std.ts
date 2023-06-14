import { RegistryFactory } from '../registries.ts'
import { formatFetchErrorMessage } from '../util.ts'

export const DenoLandStd = RegistryFactory({
  registryName: 'deno.land',
  prefix: 'deno.land/std',
  getNameFromURL(_url: string) {
    return 'std'
  },
  getCurrentVersionFromURL(url: string) {
    // this creates 2 unnessecary objects
    return url.split('/')[3].split('@')[1]
  },
  async getVersions(_name: string) {
    const res = await fetch(`https://apiland.deno.dev/v2/modules/std`)
    if (!res.ok) {
      throw new Error(
        formatFetchErrorMessage('deno.land/std module fetch error', res),
      )
    }
    const json = await res.json() as { versions: string[] }
    return json.versions
  },
  createVersionURL(_name: string, version: string | null) {
    return `https://deno.land/std@${version}`
  },
  // deno-lint-ignore require-await
  async getRepository(_name: string) {
    return 'https://github.com/denoland/deno_std'
  },
})
