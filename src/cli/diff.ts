import { diff } from '../diff.ts'
import { colors } from '../deps.ts'
import { extensions } from '../options.ts'

export async function exec(args: string[]) {
  for (const match of await diff()) {
    if (match.currentVersion === match.latestVersion) {
      continue
    }
    console.log(
      `${colors.brightBlue(match.registry)} - ${
        colors.white(match.package)
      } ${(colors.red(match.currentVersion ?? 'NONE'))} → ${
        colors.brightGreen(match.latestVersion ?? 'unknown')
      }\n    in ${colors.gray(`${match.path}:${match.line}:${match.column}`)}`,
    )
  }
}

export const description =
  'Show the difference between the current and latest versions of dependencies.'

export const flags = {
  boolean: {
    help: {
      alias: 'h',
      description: 'Show this help message and exit.',
    },
    version: {
      alias: 'v',
      description: 'Show the version number and exit.',
    },
    dir: {
      alias: 'd',
      description: 'Directory to search for files. (default: cwd)',
    },
    ext: {
      alias: 'e',
      description: `File extensions to check. (default: ${
        extensions.join(',')
      })`,
    },
  },
}

export const help = `
Usage: deno run -A --unstable https://deno.land/x/upgrade/cli/diff.ts [options]

Options:
${
  Object.entries(flags.boolean).map(([name, { description, alias }]) =>
    `    -${`${alias}, --${name}`.padEnd(15)}\t${description}`
  ).join('\n')
}
`
