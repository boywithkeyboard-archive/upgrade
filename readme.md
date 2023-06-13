## upgrade

```ts
import upgrade from 'https://deno.land/x/upgrade/mod.ts'

await upgrade({
  dir: Deno.cwd(),
  ext: ['js', 'ts', 'json', 'md']
})
```

### CLI

```bash
deno run -A https://deno.land/x/upgrade/mod.ts
```

| Command | Description | Default |
| --- | --- | --- |
| `--dir` | The parent directory of the files to check. | *Current Working Directory* |
| `--ext` | Which file extensions to include. | `js,ts,json,md` |
