## upgrade

### API

1. #### Check for changes.

   ```ts
   import { difference } from "https://deno.land/x/upgrade@v1.0.0/difference.ts";

   const changes = await difference({
     directory: Deno.cwd(),
     extensions: ["js", "jsx", "ts", "tsx", "json"],
     allowBreaking: false,
     allowUnstable: false,
   });
   ```

2. #### Submit changes.

   ```ts
   import { upgrade } from "https://deno.land/x/upgrade@v1.0.0/upgrade.ts";

   await upgrade(changes);
   ```

### CLI

### Setup

`deno.json`

```json
{
  "tasks": {
    "upgrade": "https://deno.land/x/upgrade@v1.0.0/mod.ts"
  }
}
```

### Usage

```bash
deno task upgrade
```

| Command              | Description                                 | Default                     |
| -------------------- | ------------------------------------------- | --------------------------- |
| `-d`, `--directory`  | The parent directory of the files to check. | _Current Working Directory_ |
| `-e`, `--extensions` | Which file extensions to include.           | `js,jsx,ts,tsx,json`        |
| `-b`, `--breaking`   | Allow breaking upgrades (major releases).   | `false`                     |
| `-u`, `--unstable`   | Allow unstable upgrades (prereleases).      | `false`                     |
| `-q`, `--quick`      | Disable interactive experience.             | `false`                     |

### Examples

- Pin a dependency to a specific version by appending `#pin` at the end of the
  url.

  ```ts
  import * as semver from "https://deno.land/std@0.192.0/semver/mod.ts#pin";
  ```

- Allow unstable upgrades.

  ```bash
  deno task upgrade -u
  ```

- Set the parent directory to `src`.

  ```bash
  deno task upgrade -d src
  ```

- Allow only `.js` and `.ts` files.

  ```bash
  deno task upgrade -e js,ts
  ```
