import { Registry } from './_registry.ts'

export default new Registry({
  name: 'deno.land',
  prefix: 'deno.land/std',
  getName() {
    return 'std'
  },
  getCurrentVersion(url) {
    return url.split('/')[1].split('@')[1]
  },
  async getNextVersion() {
    const res = await fetch('https://apiland.deno.dev/v2/modules/std')

    if (!res.ok) {
      throw new Error('deno.land/std fetch error')
    }

    const json = await res.json()

    return json.latest_version.startsWith('v')
      ? json.latest_version.slice(1)
      : json.latest_version
  },
  getCurrentVersionUrl(_name, version) {
    return `https://deno.land/std@${version}`
  },
  getNextVersionUrl(_name, version) {
    return `https://deno.land/std@${version}`
  },
  getRepository() {
    return 'https://github.com/denoland/deno_std'
  },
})
