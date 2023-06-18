import { gte, prerelease } from "../deps.ts";
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
  async getNextVersion() {
    const res = await fetch("https://apiland.deno.dev/v2/modules/std");

    if (!res.ok) {
      throw new Error("deno.land/std fetch error");
    }

    const json = await res.json() as { versions: string[] };

    let latestVersion;

    for (const version of json.versions) {
      if (!latestVersion) {
        latestVersion = version;
      } else if (gte(version, latestVersion) && !prerelease(version)) {
        latestVersion = version;
      }
    }

    return latestVersion as string;
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
