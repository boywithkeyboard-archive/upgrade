import { Registry } from "../Registry.ts";
import { semver } from "../deps.ts";

export const JS_DELIVR = new Registry({
  name: "cdn.jsdelivr.net",
  getName(url) {
    if (url.startsWith("cdn.jsdelivr.net/npm")) {
      const packageName = url
        .split("/")[2]
        .split("@")[0];

      if (packageName.length > 0) {
        return packageName;
      }

      return url.split("/")[2] + "/" + url.split("/")[3].split("@")[0];
    } else if (url.startsWith("cdn.jsdelivr.net/gh")) {
      return url.split("/")[2] + "/" + url.split("/")[3];
    } else {
      throw new Error();
    }
  },
  getCurrentVersion(url) {
    const scopedPackage = url.split("/")[2].split("@")[0].length === 0;

    return scopedPackage
      ? (
        url.split("/")[3].split("@")[1]
      )
      : (
        url.split("/")[2].split("@")[1]
      );
  },
  async getVersions(name: string, url: string) {
    if (url.startsWith("cdn.jsdelivr.net/npm")) {
      const res = await fetch(`https://registry.npmjs.org/${name}`);
      if (!res.ok) {
        throw new Error();
      }
      const json = await res.json() as { versions: Record<string, unknown> };
      return Object.keys(json.versions);
    } else {
      const res = await fetch(`https://api.github.com/repos/${name}/releases`);
      if (!res.ok) {
        throw new Error();
      }
      const json = await res.json() as { tag_name: string }[];
      return json.map((release) => release.tag_name);
    }
  },
  async getNextVersion(name, url) {
    const versions = await this.getVersions(name, url);
    const latestVersion = versions.filter((v) =>
      !semver.prerelease(v)
    ).sort(semver.rcompare)[0];
    return latestVersion;
  },
  getCurrentVersionUrl(name, version, url) {
    return url.includes("cdn.jsdelivr.net/npm")
      ? `https://npmjs.com/package/${name}/v/${version}`
      : `https://github.com/${name}/releases/tag/${version}`;
  },
  getNextVersionUrl(name, version, url) {
    return url.includes("cdn.jsdelivr.net/npm")
      ? `https://npmjs.com/package/${name}/v/${version}`
      : `https://github.com/${name}/releases/tag/${version}`;
  },
  async getRepository(name, url) {
    if (url.startsWith("cdn.jsdelivr.net/gh")) {
      return `https://github.com/${name}`;
    }

    const res = await fetch(`https://registry.npmjs.org/${name}`);

    if (!res.ok) {
      return undefined;
    }

    const json = await res.json();

    return json.versions[json["dist-tags"].latest].repository.url.replace(
      "git+",
      "",
    ).replace(".git", "");
  },
});
