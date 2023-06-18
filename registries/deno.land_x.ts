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
  async getNextVersion(name) {
    const res = await fetch(`https://apiland.deno.dev/v2/modules/${name}`);

    if (!res.ok) {
      throw new Error("deno.land/x fetch error");
    }

    const json = await res.json() as { versions: string[] };

    let latestVersion;

    for (const version of json.versions) {
      if (!latestVersion) {
        latestVersion = version;
      } else if (
        semver.gte(version, latestVersion) && !semver.prerelease(version)
      ) {
        latestVersion = version;
      }
    }

    return latestVersion as string;
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
