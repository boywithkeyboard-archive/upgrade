import { semver } from "../deps.ts";
import { Registry } from "../Registry.ts";

export const DENOLAND_STD = new Registry({
  name: "deno.land",
  prefix: "deno.land/std",
  getName() {
    return "std";
  },
  getCurrentVersion(url) {
    return url.split("/")[1].split("@")[1];
  },
  async getVersions() {
    const res = await fetch("https://apiland.deno.dev/v2/modules/std");

    if (!res.ok) {
      throw new Error("deno.land/std fetch error");
    }

    const json = await res.json() as { versions: string[] };

    return json.versions;
  },
  async getNextVersion(name: string, url: string) {
    const versions = await this.getVersions(name, url);
    const latestVersion = versions.filter((v) =>
      !semver.prerelease(v)
    ).sort(semver.rcompare)[0];
    return latestVersion;
  },
  getCurrentVersionUrl(_name, version) {
    return `https://deno.land/std@${version}`;
  },
  getNextVersionUrl(_name, version) {
    return `https://deno.land/std@${version}`;
  },
  getRepository() {
    return "https://github.com/denoland/deno_std";
  },
});
