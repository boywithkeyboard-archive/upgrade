import { RegistryFactory } from '../registries.ts'

export const EsmSh = RegistryFactory({
  registryName: 'esm.sh',
  getNameFromURL(url: string) {
    const packageName = url.split('/')[1].split('@')[0]
    if (packageName.length > 0) {
      return packageName
    }
    return url.split('/')[1] + '/' + url.split('/')[2].split('@')[0]
  },
  getCurrentVersionFromURL(url: string) {
    const scopedPackage = url.split('/')[1].split('@')[0].length === 0
    if (scopedPackage) {
      return url.split('/')[2].split('@')[1]
    }
    return url.split('/')[1].split('@')[1]
  },
  async getVersions(name: string) {
    const res = await fetch(`https://registry.npmjs.org/${name}`)

    if (!res.ok) {
      throw new Error(`esm.sh ${name} fetch error`)
    }

    const json = await res.json() as { versions: Record<string, unknown> }
    return Object.keys(json.versions)
  },
  createVersionURL(name: string, version: string) {
    return `https://npmjs.com/package/${name}/v/${version}`
  },
  async getRepository(name: string) {
    const res = await fetch(`https://registry.npmjs.org/${name}`)

    if (!res.ok) {
      return undefined
    }

    const json = await res.json() as {
      repository: { url: string }
    }
    return json.repository.url.replace(
      'git+',
      '',
    ).replace('.git', '')
  },
})
