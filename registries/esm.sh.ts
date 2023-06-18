import { Registry } from "../Registry.ts";

export default class ESM_SH extends Registry {
  static registryName = "esm.sh";
  static urlPrefix = "https://esm.sh";

  static getModuleNameFromURL(url: string) {
    const moduleName = url
      .split("/")[1]
      .split("@")[0];
    if (moduleName.length > 0) {
      return moduleName;
    }
    return url.split("/")[1] + "/" + url.split("/")[2].split("@")[0];
  }

  static getVersionFromURL(url: string) {
    const isScopedPackage = url.split("/")[1].split("@")[0].length === 0;
    if (isScopedPackage) {
      return url.split("/")[2].split("@")[1];
    }
    return url.split("/")[1].split("@")[1];
  }

  static async getVersions(moduleName: string) {
    const res = await fetch(`https://registry.npmjs.org/${moduleName}`);
    if (!res.ok) {
      throw new Error(this.buildFetchErrorMessage(moduleName));
    }
    const json = await res.json() as { versions: string[] };
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
