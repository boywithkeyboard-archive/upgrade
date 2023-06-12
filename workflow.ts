import { createMarkdown } from './createMarkdown.ts'
import upgrade from './mod.ts'

const { upgrades } = await upgrade()

, markdown = await createMarkdown(upgrades)

await Deno.writeTextFile('./upgrade.md', markdown)
