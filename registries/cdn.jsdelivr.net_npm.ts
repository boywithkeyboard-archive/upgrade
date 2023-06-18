import { Registry } from "../Registry.ts";

export default class JS_DELIVR_NPM extends Registry {
  static registryName = "cdn.jsdelivr.net/npm";
  static urlPrefix = "https://cdn.jsdelivr.net/npm";
  static getModuleNameFromURL(url: string) {
    const packageName = url
      .split("/")[2]
      .split("@")[0];

    if (packageName.length > 0) {
      return packageName;
    }

    return url.split("/")[2] + "/" + url.split("/")[3].split("@")[0];
  }
  static getVersionFromURL(url: string) {
    const isScopedPackage = url.split("/")[2].split("@")[0].length === 0;
    if (isScopedPackage) {
      return url.split("/")[3].split("@")[1];
    }
    return url.split("/")[2].split("@")[1];
  }
  static async fetchVersions(moduleName: string) {
    const res = await fetch(`https://registry.npmjs.org/${moduleName}`);
    if (!res.ok) {
      throw new Error(this.buildFetchErrorMessage(moduleName));
    }
    const json = await res.json() as { versions: Record<string, unknown> };
    return Object.keys(json.versions);
  }
  static async fetchRepository(moduleName: string) {
    const res = await fetch(`https://registry.npmjs.org/${moduleName}`);
    if (!res.ok) {
      return undefined;
    }
    const json = await res.json() as { repository: { url: string } };
    return json.repository.url.slice(0, -4);
  }
}
