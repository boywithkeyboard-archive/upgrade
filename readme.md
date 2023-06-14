## Upgrade CLI & Library

Upgrade is a Command-Line Interface (CLI) tool built with Deno and TypeScript developed to manage and check file structures for outdated dependencies. It provides two primary commands, now and diff, to upgrade dependencies to the latest versions and show differences between current and latest dependencies respectively.

Upgrade can be executed without arguments, running the now command with default parameters. Each command is equipped with a series of flags for more detailed and customizable operations.

## Getting Started

### Installation

The Upgrade CLI doesn't require traditional installation as it's executable directly via Deno:

```bash
deno run -A https://deno.land/x/upgrade@v0.3.0/main.ts
```

But if you use the tool often, it is a good idea to run `deno install`.

```bash
deno install -A -n upgrade https://deno.land/x/upgrade@v0.3.0/main.ts
```

## Commands
Upgrade CLI primarily supports the following two commands:

1. `now`: This command checks the file structure for outdated dependencies and automatically upgrades them to the latest version. If no arguments are provided when executing the CLI tool, this command runs with default parameters.

2. `diff`: This command checks the file structure for outdated dependencies and reports the differences between the current and latest versions.

## Flags
Each command accepts three flags for advanced use-cases:

| Alias | Flag     | Description                                 | Default                     |
| ----- | -------- | ------------------------------------------- | --------------------------- |
| `-d`  | `--dir`  | The parent directory of the files to check. | _Current Working Directory_ |
| `-e`  | `--ext`  | Which file extensions to include.           | `js,ts,json,md,tsx,jsx`     |
| `-h`  | `--help` | Displays information about the command      | 

## Usage Examples
Check the file structure in the current directory and upgrade all dependencies to the latest version:

```bash
deno run -A https://deno.land/x/upgrade@v0.3.0/main.ts
```

Check the file structure in a specific directory and upgrade all dependencies to the latest version:

```bash
deno run -A https://deno.land/x/upgrade@v0.3.0/main.ts --dir /path/to/dir
```

Check the file structure in the current directory for .ts and .js files and upgrade all dependencies to the latest version:

```bash
deno run -A https://deno.land/x/upgrade@v0.3.0/main.ts --ext ts,js
```

Display differences between current and latest dependencies in a specific directory:

```bash
deno run -A https://deno.land/x/upgrade@v0.3.0/main.ts diff --dir /path/to/dir
```

For additional help or information, use the -h or --help flag:
```bash
deno run -A https://deno.land/x/upgrade@v0.3.0/main.ts --help
deno run -A https://deno.land/x/upgrade@v0.3.0/main.ts diff --help
```
