import { formatFetchErrorMessage } from '../util.ts'
import { RegistryFactory } from '../registries.ts'

export const Github = RegistryFactory({
  registryName: 'raw.githubusercontent.com',
  getNameFromURL(url: string) {
    // this creates 2 unnessecary objects
    return url.split('/')[1] + '/' + url.split('/')[2] // org/repo
  },
  getCurrentVersionFromURL(url: string) {
    // this creates 2 unnessecary objects
    return url.split('/')[3]
  },
  async getVersions(name: string) {
    const res = await fetch(`https://api.github.com/repos/${name}/releases`)

    if (!res.ok) {
      throw new Error(
        formatFetchErrorMessage(
          'raw.githubusercontent.com releases fetch error',
          res,
        ),
      )
    }

    const json = await res.json() as {
      tag_name: string
    }[]
    return json.map((release) => release.tag_name)
  },
  createVersionURL(name: string, version: string) {
    return `https://github.com/${name}/releases/tag/${version}`
  },
  // deno-lint-ignore require-await
  async getRepository(name: string) {
    return `https://github.com/${name}`
  },
})
