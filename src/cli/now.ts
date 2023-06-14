import { colors, parseFlags } from '../deps.ts'
import { extensions } from '../options.ts'
import { now } from '../now.ts'

export async function exec(args: string[]) {
  const flags = parseFlags(args, Flags)
  const result = await now({
    dir: flags.dir,
    extensions: flags.extensions,
  })
  for (const match of result) {
    if (match.currentVersion === match.latestVersion) {
      continue
    }
    console.log(
      `${match.success ? colors.green('SUCCESS') : colors.red('FAILURE')} ${
        colors.brightBlue(match.registry.registryName)
      } - ${
        colors.white(match.package)
      } ${(colors.red(match.currentVersion ?? 'NONE'))} → ${
        colors.brightGreen(match.latestVersion ?? 'unknown')
      }\n    in ${colors.gray(`${match.path}:${match.line}:${match.column}`)}`,
    )
  }
  console.log(
    `${colors.green('SUCCESS')} ${
      result.filter((match) => match.success).length
    } ${colors.red('FAILURE')} ${
      result.filter((match) => !match.success).length
    }`,
  )
}

export const Descriptions = {
  main: 'Update dependencies to their latest versions.',
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
