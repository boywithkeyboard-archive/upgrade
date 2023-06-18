import { Registry } from "../Registry.ts";

export default class DenoLandSTD extends Registry {
  static registryName = "deno.land/std";
  static urlPrefix = "https://deno.land/std";

  static getModuleNameFromURL(_url: string) {
    return "std";
  }

  static getVersionFromURL(url: string) {
    return url.split("/")[1].split("@")[1];
  }

  static async fetchVersions() {
    const res = await fetch("https://apiland.deno.dev/v2/modules/std");

    if (!res.ok) {
      throw new Error(this.buildFetchErrorMessage("std"));
    }

    const json = await res.json() as { versions: string[] };

    return json.versions;
  }

  // deno-lint-ignore require-await
  static async fetchRepository(_moduleName: string) {
    return `https://github.com/denoland/deno_std`;
  }
}
