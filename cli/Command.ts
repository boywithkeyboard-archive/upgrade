import { parseFlags } from '../deps.ts'

export type CommandFlags = Parameters<typeof parseFlags>[1]
export type CommandArgs = Parameters<typeof parseFlags>[0]

interface Command {
  name?: string
  exec: (args: CommandArgs) => Promise<void>
  flags?: CommandFlags
  descriptions?: Map<string, string>
}

export function CommandFactory(cmd: Command) {
  if (cmd.flags === undefined) {
    cmd.flags = {}
  }
  {if (cmd.flags.boolean === undefined) {
    cmd.flags.boolean = []
  }}

  (cmd.flags.boolean as string[]).push('help')
  if (cmd.flags.alias === undefined) {
    cmd.flags.alias = {}
  }
  if (cmd.descriptions === undefined) {
    cmd.descriptions = new Map()
  }
  cmd.descriptions.set('help', 'Shows help')
  cmd.flags.alias['h'] = 'help'
  return {
    name: cmd.name ?? cmd.exec.name,
    async exec(args: CommandArgs) {
      const flags = parseFlags(args, this.flags)
      if (
        (flags['help'] !== undefined && flags['help']) || flags._[0] === 'help'
      ) {
        console.info(`
Usage: deno run -A https://deno.land/x/upgrade@v0.3.0/cli.ts ${this.name}
${this.descriptions?.get('main') ?? ''}

Flags:`)
        console.info(
          (this.flags.boolean as string[] ?? []).map((flag) => {
            return `     -${
              (Object.entries(this.flags.alias ?? {}).find((v) =>
                v[1] === flag
              ))![0] ?? ''
            } --${flag.padEnd(20)}${this.descriptions?.get(flag) ?? ''}`
          }).join('\n') ?? '',
        )
        console.info(
          (this.flags.string as string[] ?? []).map((flag) => {
            return `     -${
              (Object.entries(this.flags.alias ?? {}).find((v) =>
                v[1] === flag
              ))![0] ?? ''
            } --${flag.padEnd(20)}${this.descriptions?.get(flag) ?? ''}`
          }).join('\n') ?? '',
        )
        Deno.exit()
      }
      await cmd.exec(args)
    },
    descriptions: cmd.descriptions ?? new Map(),
    flags: cmd.flags,
  } as Required<Command>
}
