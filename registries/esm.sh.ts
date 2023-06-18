import { Registry } from "../Registry.ts";
import { semver } from "../deps.ts";

export const ESM_SH = new Registry({
  name: "esm.sh",
  getName(url) {
    const packageName = url
      .split("/")[1]
      .split("@")[0];

    if (packageName.length > 0) {
      return packageName;
    }

    return url.split("/")[1] + "/" + url.split("/")[2].split("@")[0];
  },
  getCurrentVersion(url) {
    const scopedPackage = url.split("/")[1].split("@")[0].length === 0;

    return scopedPackage
      ? (
        url.split("/")[2].split("@")[1]
      )
      : (
        url.split("/")[1].split("@")[1]
      );
  },
  async getVersions(name, url) {
    const res = await fetch(`https://registry.npmjs.org/${name}`);

    if (!res.ok) {
      throw new Error("esm.sh fetch error");
    }

    const json = await res.json();

    return Object.keys(json.versions);
  },
  async getNextVersion(name, url) {
    const versions = await this.getVersions(name, url);
    const latestVersion = versions.filter((v) =>
      !semver.prerelease(v)
    ).sort(semver.rcompare)[0];
    return latestVersion;
  },
  getCurrentVersionUrl(name, version) {
    return `https://npmjs.com/package/${name}/v/${version}`;
  },
  getNextVersionUrl(name, version) {
    return `https://npmjs.com/package/${name}/v/${version}`;
  },
  async getRepository(name) {
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
