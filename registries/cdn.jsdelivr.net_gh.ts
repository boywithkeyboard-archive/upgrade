import { Registry } from "../Registry.ts";

export default class JS_DELIVR_GH extends Registry {
  static registryName = "cdn.jsdelivr.net/gh";
  static urlPrefix = "https://cdn.jsdelivr.net/gh";
  static getModuleNameFromURL(url: string) {
    return url.split("/")[2] + "/" + url.split("/")[3];
  }
  static getVersionFromURL(url: string) {
    const isScopedPackage = url.split("/")[2].split("@")[0].length === 0;
    if (isScopedPackage) {
      return url.split("/")[3].split("@")[1];
    }
    return url.split("/")[2].split("@")[1];
  }
  static async fetchVersions(moduleName: string) {
    const res = await fetch(
      `https://api.github.com/repos/${moduleName}/releases`,
    );
    if (!res.ok) {
      throw new Error(this.buildFetchErrorMessage(moduleName));
    }
    const json = await res.json() as { tag_name: string }[];
    return json.map((release) => release.tag_name);
  }
  // deno-lint-ignore require-await
  static async fetchRepository(moduleName: string) {
    return `https://github.com/${moduleName}`;
  }
}
