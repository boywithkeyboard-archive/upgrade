import { Change } from "./Change.d.ts";
import { semver } from "./deps.ts";
import { walk } from "./walk.ts";

export async function difference({
  allowBreaking,
  allowUnstable,
  directory = Deno.cwd(),
  extensions = ["js", "jsx", "ts", "tsx", "json"],
}: {
  allowBreaking?: boolean;
  allowUnstable?: boolean;
  directory?: string;
  extensions?: string[];
} = {}): Promise<Change[]> {
  const cache = new Map<string, string>();
  const changes: Change[] = [];

  for await (const { path, registry, url } of walk(directory, extensions)) {
    try {
      const moduleName = registry.getModuleNameFromURL(url);
      const currentVersion = registry.getVersionFromURL(url);

      if (!semver.valid(currentVersion)) {
        continue;
      }
      let nextVersion: string;

      try {
        nextVersion = cache.get(`${registry.name}:${moduleName}`) ??
          await registry.fetchNextVersion(moduleName, currentVersion);
      } catch (_) {
        changes.push({
          moduleName,
          registryName: registry.name,
          url,
          filePath: path,
          type: "fail",
        });

        continue;
      }

      if (!cache.has(`${registry.name}:${moduleName}`)) {
        cache.set(`${registry.name}:${moduleName}`, nextVersion);
      }

      const difference = semver.difference(currentVersion, nextVersion);

      if (
        difference === null || // same version
        !allowBreaking && difference === "major" || // breaking
        !allowUnstable && difference === "prerelease" || // unstable
        url.endsWith("#pin")
      ) {
        changes.push({
          moduleName,
          registryName: registry.name,
          url,
          currentVersion,
          nextVersion,
          filePath: path,
          reason: difference === "major"
            ? "breaking"
            : difference === "prerelease"
            ? "unstable"
            : url.endsWith("#pin")
            ? "pinned"
            : "same",
          type: "skip",
        });

        continue;
      }

      changes.push({
        moduleName,
        registryName: registry.name,
        url,
        currentVersion,
        nextVersion,
        filePath: path,
        type: "upgrade",
      });
    } catch (_) {
      continue;
    }
  }
  return changes;
}
