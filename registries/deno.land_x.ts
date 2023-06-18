import { semver } from "../deps.ts";
import { Registry } from "../Registry.ts";

export const DENOLAND_X = new Registry({
  name: "deno.land",
  prefix: "deno.land/x",
  getName(url) {
    return url.split("/")[2].split("@")[0];
  },
  getCurrentVersion(url) {
    return url.split("/")[2].split("@")[1];
  },
  async getVersions(name: string) {
    const res = await fetch(`https://apiland.deno.dev/v2/modules/${name}`);
    if (!res.ok) {
      throw new Error("deno.land/x fetch error");
    }
    const json = await res.json() as { versions: string[] };
    return json.versions;
  },
  async getNextVersion(name, url) {
    const versions = await this.getVersions(name, url);
    const latestVersion = versions.filter((v) =>
      !semver.prerelease(v)
    ).sort(semver.rcompare)[0];
    return latestVersion;
  },
  getCurrentVersionUrl(name, version) {
    return `https://deno.land/x/${name}@${version}`;
  },
  getNextVersionUrl(name, version) {
    return `https://deno.land/x/${name}@${version}`;
  },
  async getRepository(name) {
    const res = await fetch(
      `https://apiland.deno.dev/v2/metrics/modules/${name}`,
    );

    if (!res.ok) {
      return undefined;
    }

    return `https://github.com/${
      (await res.json()).info.upload_options.repository
    }`;
  },
});
