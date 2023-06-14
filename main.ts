import commands from './cli/commands/mod.ts'

for (const command of commands) {
  if (Deno.args[0] === command.name) {
    await command.exec(Deno.args.slice(1))
    Deno.exit()
  }
}

const command = commands.find((v) => v.name === 'now')
if (command) {
  await command.exec(Deno.args)
  Deno.exit()
}

const help = `
Usage: deno run -A https://deno.land/x/upgrade@v0.3.0/cli.ts

Commands:
  ${
  commands.map((command) =>
    `${command.name.padEnd(20)}${
      command.descriptions.get('main') ?? command.descriptions
    }`
  ).join('\n  ')
}
`
console.log(help)
