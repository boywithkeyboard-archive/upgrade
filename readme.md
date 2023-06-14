## upgrade

```ts
import upgrade from 'https://deno.land/x/upgrade@v0.3.0/mod.ts'

await upgrade({
  dir: Deno.cwd(),
  ext: ['js', 'ts', 'json', 'md'],
})
```

### CLI

```bash
deno run -A https://deno.land/x/upgrade@v0.3.0/main.ts
```

| Command | Description                                 | Default                     |
| ------- | ------------------------------------------- | --------------------------- |
| `--dir` | The parent directory of the files to check. | _Current Working Directory_ |
| `--ext` | Which file extensions to include.           | `js,ts,json,md`             |
