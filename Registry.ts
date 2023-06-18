import { semver } from "./deps.ts";

export abstract class Registry {
  static registryName: string;
  static urlPrefix: string;
  static getModuleNameFromURL: (url: string) => string;
  static getVersionFromURL: (url: string) => string;
  static fetchVersions: (name: string) => Promise<string[]>;
  static fetchRepository: (moduleName: string) => Promise<string | undefined>;
  /**
   * Fetches the latest version of a given module.
   * ignores prerelease versions by default.
   */
  static async fetchLatestVersion(moduleName: string, options: {
    usePrerelease?: boolean;
  } = {}): Promise<string> {
    const versions = await this.fetchVersions(moduleName);
    const latestVersion = versions.filter((v) => {
      return (options.usePrerelease ?? false) || !semver.prerelease(v);
    }).sort(
      semver.rcompare,
    )[0];
    return latestVersion;
  }
  /**
   * Fetches the next version of a given module.
   * If the current version is the latest version,
   * it will return the current version.
   * ignores prerelease versions by default.
   */
  static async fetchNextVersion(
    moduleName: string,
    currentVersion: string,
    options: {
      usePrerelease?: boolean;
    } = {},
  ): Promise<string> {
    const versions = await this.fetchVersions(moduleName);
    const sortedVersions = versions.filter((v) => {
      return (options.usePrerelease ?? false) || !semver.prerelease(v);
    }).sort(
      semver.rcompare,
    );
    const currentVersionIndex = sortedVersions.indexOf(currentVersion);
    if (currentVersionIndex === -1) {
      throw new Error(
        `Current version ${currentVersion} not found in ${moduleName}`,
      );
    }
    if (currentVersionIndex === 0) {
      return currentVersion;
    }
    return sortedVersions[
      currentVersionIndex - 1
    ];
  }
  /**
   * Builds a versioned URL for a given module and version.
   */
  static buildVersionedURL(moduleName: string, version: string): string {
    return `${this.urlPrefix}/${moduleName}@${version}`;
  }
  /**
   * Builds an error message for when a module is not found.
   * Use this as the message when throwing an error for
   * fetching module data.
   */
  static buildFetchErrorMessage(moduleName: string): string {
    return `${this.registryName} fetch error for ${moduleName}`;
  }
}
