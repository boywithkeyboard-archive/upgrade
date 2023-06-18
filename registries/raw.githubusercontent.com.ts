import { Registry } from "../Registry.ts";

export default class GITHUB extends Registry {
  static registryName = "raw.githubusercontent.com";
  static urlPrefix = "https://raw.githubusercontent.com";

  static getModuleNameFromURL(url: string) {
    return url.split("/")[1] + "/" + url.split("/")[2]; // org/repo
  }

  static getVersionFromURL(url: string) {
    return url.split("/")[3];
  }

  static async getVersions(moduleName: string) {
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
