import { Change } from "./Change.d.ts";

export async function upgrade(changes: Change[]) {
  for (const change of changes) {
    if (change.type !== "upgrade") {
      continue;
    }

    const content = await Deno.readTextFile(change.filePath);

    if (!change.currentVersion || !change.nextVersion) {
      continue;
    }

    await Deno.writeTextFile(
      change.filePath,
      content.replace(
        change.url,
        change.url.replace(change.currentVersion, change.nextVersion),
      ),
    );
  }
}
