import { diff } from '../diff.ts'
import { colors, parseFlags } from '../deps.ts'
import { extensions } from '../options.ts'

export async function exec(args: string[]) {
  const flags = parseFlags(args, Flags)
  for (
    const match of await diff({
      dir: flags.dir,
      extensions: flags.extensions,
    })
  ) {
    if (match.currentVersion === match.latestVersion) {
      continue
    }
    console.log(
      `${colors.brightBlue(match.registry.registryName)} - ${
        colors.white(match.package)
      } ${(colors.red(match.currentVersion ?? 'NONE'))} → ${
        colors.brightGreen(match.latestVersion ?? 'unknown')
      }\n    in ${colors.gray(`${match.path}:${match.line}:${match.column}`)}`,
    )
  }
}

export const Descriptions = {
  main:
    'Show the difference between the current and latest versions of dependencies.',
  dir: 'Directory to search for files to diff',
  extensions: 'File extensions to search for',
  help: 'Show help',
}

export const Flags: Parameters<typeof parseFlags>[1] = {
  boolean: ['help'],
  alias: {
    help: 'h',
    dir: 'd',
    extensions: 'e',
  },
  default: {
    dir: Deno.cwd(),
    extensions,
  },
  string: ['dir', 'extensions'],
} as const
