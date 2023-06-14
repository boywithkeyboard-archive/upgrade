import * as cli from './cli/mod.ts'

for (const [name, command] of Object.entries(cli)) {
  if (Deno.args[0] === name) {
    await command.exec(Deno.args.slice(1))
    Deno.exit()
  }
}

const help = `
Usage: deno run -A https://deno.land/x/upgrade@v0.3.0/cli.ts

Commands:
  ${
  Object.entries(cli).map(([name, command]) =>
    `${name.padEnd(20)}${command.Descriptions.main}`
  ).join('\n  ')
}
`
console.log(help)
