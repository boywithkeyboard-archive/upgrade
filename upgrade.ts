import { Change } from "./Change.d.ts";

export async function upgrade(changes: Change[]) {
  const files: string[] = [];
  const dependencies: string[] = [];

  for (const change of changes) {
    if (change.type !== "upgrade") {
      continue;
    }

    if (!files.includes(change.filePath)) {
      files.push(change.filePath);
    }

    if (!dependencies.includes(change.moduleName)) {
      dependencies.push(change.moduleName);
    }

    if (!change.currentVersion || !change.nextVersion) {
      continue;
    }

    const content = await Deno.readTextFile(change.filePath);

    await Deno.writeTextFile(
      change.filePath,
      content.replace(
        change.url,
        change.url.replace(change.currentVersion, change.nextVersion),
      ),
    );
  }

  return {
    /**
     * Amount of updated files.
     */
    files: files.length,
    /**
     * Amount of updated dependencies.
     */
    dependencies: dependencies.length,
  };
}
