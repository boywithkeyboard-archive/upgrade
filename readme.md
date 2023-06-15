## upgrade

### To Do

- [ ] make upgrade interactive

### API

```ts
import upgrade from 'https://deno.land/x/upgrade/mod.ts'

await upgrade({
  dir: Deno.cwd(),
  ext: ['js', 'ts', 'json', 'md'],
})
```

### CLI

```bash
deno run -A https://deno.land/x/upgrade@v0.4.0/mod.ts
```

| Command            | Description                                 | Default                     |
| ------------------ | ------------------------------------------- | --------------------------- |
| `-d`, `--dir`      | The parent directory of the files to check. | _Current Working Directory_ |
| `-e`, `--ext`      | Which file extensions to include.           | `js,jsx,ts,tsx,json,md`     |
| `-b`, `--breaking` | Allow breaking upgrades (major releases).   | `false`                     |
| `-u`, `--unstable` | Allow unstable upgrades (prereleases).      | `false`                     |

### Examples

- Allow breaking upgrades.

  ```bash
  deno run -A https://deno.land/x/upgrade@v0.4.0/mod.ts -b
  ```

- Allow unstable upgrades.

  ```bash
  deno run -A https://deno.land/x/upgrade@v0.4.0/mod.ts -u
  ```

- Set the parent directory to `src`.

  ```bash
  deno run -A https://deno.land/x/upgrade@v0.4.0/mod.ts -d src
  ```
