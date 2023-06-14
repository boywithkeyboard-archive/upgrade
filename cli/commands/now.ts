import { CommandArgs, CommandFactory } from '../Command.ts'
import { colors, parseFlags } from '../../deps.ts'
import { now } from '../../now.ts'
import { defaultExtensions } from '../../config.ts'

export default CommandFactory({
  name: 'now',
  exec: async function (args: CommandArgs) {
    console.info(colors.gray('checking for differences in dependencies...'))
    const flags = parseFlags(args, this.flags)
    const matches = await now({
      dir: flags.dir ?? Deno.cwd(),
      extensions: flags.ext.split(',') ?? defaultExtensions,
    })
    if (
      matches.filter((v) => v.currentVersion !== v.latestVersion).length === 0
    ) {
      console.info(colors.green('no differences found!'))
      return
    } else {
      console.info(colors.red('some differences found:'))
    }
    for (
      const match of matches
    ) {
      if (match.currentVersion === match.latestVersion) {
        continue
      }
      console.log(
        `${colors.brightBlue(match.registry.registryName)} - ${
          colors.white(match.package)
        } ${(colors.red(match.currentVersion ?? 'NONE'))} → ${
          colors.brightGreen(match.latestVersion ?? 'unknown')
        }\n    in ${
          colors.gray(`${match.path}:${match.line}:${match.column}`)
        }`,
      )
    }
  },
  flags: {
    string: ['dir', 'ext'],
    alias: {
      d: 'dir',
      e: 'ext',
    },
    default: {
      dir: Deno.cwd(),
    },
  },
  descriptions: new Map([
    [
      'main',
      'Upgrades dependencies to their latest versions.',
    ],
    [
      'dir',
      'The directory to search for dependencies. Defaults to the current directory.',
    ],
    [
      'ext',
      `The file extension to search for dependencies. Defaults to ${
        defaultExtensions.join(',')
      }.`,
    ],
  ]),
})
