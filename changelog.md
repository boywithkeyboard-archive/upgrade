## [v1.0.0](https://github.com/azurystudio/upgrade/releases/tag/v1.0.0)

- **Breaking Changes**

  - The TypeScript modules are no longer exported from the main file.

    ```ts
    // before
    import upgrade from "https://deno.land/x/upgrade@v1.0.0/mod.ts";

    // now
    import { difference } from "https://deno.land/x/upgrade@v1.0.0/difference.ts";
    import { upgrade } from "https://deno.land/x/upgrade@v1.0.0/upgrade.ts";
    ```

- **New Features**

  - The CLI is now interactive by default. You can disable this behavior by
    attaching the `--quick` flag.

  - You can now use **upgrade** either for _checking_ for updates or _updating_
    your codebase.

    ```ts
    import { difference } from 'https://deno.land/x/upgrade@v1.0.0/difference.ts'
    import { upgrade } from 'https://deno.land/x/upgrade@v1.0.0/upgrade.ts'

    const changes = await difference(...)

    await upgrade(changes)
    ```

- **Revisions**

  - **upgrade** does no longer update a dependency to a major version by
    default.

  - Markdown files are now ignored by default.
