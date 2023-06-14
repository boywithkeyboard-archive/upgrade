import { rcompare } from '../deps.ts'

interface Registry {
  registryName: string
  prefix?: string
  getNameFromURL: (url: string) => string
  getCurrentVersionFromURL: (url: string) => string | null
  getVersions: (name: string) => Promise<string[]>
  getLatestVersion?: (name: string) => Promise<string>
  getNextVersion?: (name: string, version: string) => Promise<string>
  createVersionURL: (name: string, version: string | null) => string
  getRepository: (
    name: string,
  ) => Promise<string | undefined>
}

export function RegistryFactory(registry: Registry) {
  return {
    registryName: registry.registryName,
    prefix: registry.prefix ?? registry.registryName,
    getNameFromURL: registry.getNameFromURL,
    getCurrentVersionFromURL: registry.getCurrentVersionFromURL,
    getVersions: registry.getVersions,
    createVersionURL: registry.createVersionURL,
    getRepository: registry.getRepository,
    async getLatestVersion(name: string) {
      const versions = await this.getVersions(name)
      const sortedVersions = versions.sort((a, b) => rcompare(a, b))
      return sortedVersions[0]
    },
    async getNextVersion(name: string, version: string) {
      const versions = await this.getVersions(name)
      const sortedVersions = versions.sort((a, b) => rcompare(a, b))
      const index = sortedVersions.indexOf(version)
      if (index === -1) {
        throw new Error(`Version ${version} not found in ${name}`)
      }
      return sortedVersions[index - 1] ?? version
    },
  } as Required<Registry>
}

export * from './deno.land-x.ts'
export * from './deno.land-std.ts'
export * from './raw.githubusercontent.com.ts'
export * from './cdn.jsdelivr.net-npm.ts'
export * from './cdn.jsdelivr.net-gh.ts'
export * from './esm.sh.ts'
