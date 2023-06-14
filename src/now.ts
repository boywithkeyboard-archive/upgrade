import { diff } from './diff.ts'
import { extensions as defaultExtensions } from './options.ts'

type NowOptions = Parameters<typeof diff>[0]

export async function now(fnOptions: Partial<NowOptions> = {
  dir: Deno.cwd(),
  extensions: defaultExtensions,
}) {
  const options = {
    dir: fnOptions.dir ?? Deno.cwd(),
    extensions: fnOptions.extensions ?? defaultExtensions,
  }
  const result = []
  const matches = await diff(options)
  for (const match of matches) {
    if (match.currentVersion === match.latestVersion) {
      continue
    }
    if (match.latestVersion === undefined) {
      continue
    }
    try {
      const file = await Deno.readTextFile(match.path)
      const lines = file.split('\n')
      const line = lines[match.line - 1]
      const newLine = line.replace(
        match.registry.createVersionURL(match.package, match.currentVersion),
        match.registry.createVersionURL(match.package, match.latestVersion),
      )
      const newFile = [
        lines.slice(0, match.line - 1),
        newLine,
        lines.slice(match.line),
      ].flat().join('\n')
      await Deno.writeTextFile(match.path, newFile)
      result.push({
        ...match,
        success: true,
      })
    } catch {
      result.push({
        ...match,
        success: false,
      })
    }
  }
  return result
}
