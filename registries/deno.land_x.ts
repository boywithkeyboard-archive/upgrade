import { Registry } from "../Registry.ts";

export default class DenoLandX extends Registry {
  static registryName = "deno.land/x";
  static urlPrefix = "https://deno.land/x";
  static getModuleNameFromURL(url: string) {
    return url.split("/")[2].split("@")[0];
  }
  static getVersionFromURL(url: string) {
    return url.split("/")[2].split("@")[1];
  }
  static async fetchVersions(moduleName: string) {
    const res = await fetch(
      `https://apiland.deno.dev/v2/modules/${moduleName}`,
    );
    if (!res.ok) {
      throw new Error(this.buildFetchErrorMessage(moduleName));
    }
    const json = await res.json() as { versions: string[] };
    return json.versions;
  }
  static async fetchRepository(moduleName: string) {
    const res = await fetch(
      `https://apiland.deno.dev/v2/modules/${moduleName}`,
    );
    if (!res.ok) {
      return undefined;
    }
    const json = await res.json() as {
      info: { upload_options: { repository: string } };
    };
    return `https://github.com/${json.info.upload_options.repository}`;
  }
}
