import { Registry } from "../Registry.ts";
import { semver } from "../deps.ts";

export const GITHUB = new Registry({
  name: "raw.githubusercontent.com",
  getName(url) {
    return url.split("/")[1] + "/" + url.split("/")[2]; // org/repo
  },
  getCurrentVersion(url) {
    return url.split("/")[3];
  },
  async getVersions(name) {
    const res = await fetch(`https://api.github.com/repos/${name}/releases`);
    if (!res.ok) {
      throw new Error("raw.githubusercontent.com fetch error");
    }
    const json = await res.json() as { tag_name: string }[];
    return json.map((release) => release.tag_name);
  },
  async getNextVersion(name, url) {
    const versions = await this.getVersions(name, url);
    const latestVersion = versions.filter((v) =>
      !semver.prerelease(v)
    ).sort(semver.rcompare)[0];
    return latestVersion;
  },
  getCurrentVersionUrl(name, version) {
    return `https://github.com/${name}/releases/tag/${version}`;
  },
  getNextVersionUrl(name, version) {
    return `https://github.com/${name}/releases/tag/${version}`;
  },
  getRepository(name) {
    return `https://github.com/${name}`;
  },
});
