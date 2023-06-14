import * as cli from './cli/mod.ts'

for (const [name, command] of Object.entries(cli)) {
  if (Deno.args[0] === name) {
    if (Deno.args.some((arg) => arg === '-h' || arg === '--help')) {
      console.log(command.help)
      Deno.exit()
    }
    await command.exec(Deno.args.slice(1))
    Deno.exit()
  }
}

const help = `
Usage: deno run -A https://deno.land/x/upgrade/cli.ts

Commands:
  ${
  Object.entries(cli).map(([name, command]) =>
    `${name.padEnd(20)}${command.description}`
  ).join('\n  ')
}
`
console.log(help)
