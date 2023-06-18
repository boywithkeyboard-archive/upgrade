import { Registry } from "../Registry.ts";

export const JS_DELIVR = new Registry({
  name: "cdn.jsdelivr.net",
  getName(url) {
    if (url.startsWith("cdn.jsdelivr.net/npm")) {
      const packageName = url
        .split("/")[2]
        .split("@")[0];

      if (packageName.length > 0) {
        return packageName;
      }

      return url.split("/")[2] + "/" + url.split("/")[3].split("@")[0];
    } else if (url.startsWith("cdn.jsdelivr.net/gh")) {
      return url.split("/")[2] + "/" + url.split("/")[3];
    } else {
      throw new Error();
    }
  },
  getCurrentVersion(url) {
    const scopedPackage = url.split("/")[2].split("@")[0].length === 0;

    return scopedPackage
      ? (
        url.split("/")[3].split("@")[1]
      )
      : (
        url.split("/")[2].split("@")[1]
      );
  },
  async getNextVersion(name, url) {
    if (url.startsWith("cdn.jsdelivr.net/npm")) {
      const res = await fetch(`https://registry.npmjs.org/${name}`);

      if (!res.ok) {
        throw new Error();
      }

      return (await res.json())["dist-tags"].latest;
    } else {
      const res = await fetch(`https://api.github.com/repos/${name}/releases`);

      if (!res.ok) {
        throw new Error("cdn.jsdelivr.net fetch error");
      }

      return (await res.json())[0].tag_name;
    }
  },
  getCurrentVersionUrl(name, version, url) {
    return url.includes("cdn.jsdelivr.net/npm")
      ? `https://npmjs.com/package/${name}/v/${version}`
      : `https://github.com/${name}/releases/tag/${version}`;
  },
  getNextVersionUrl(name, version, url) {
    return url.includes("cdn.jsdelivr.net/npm")
      ? `https://npmjs.com/package/${name}/v/${version}`
      : `https://github.com/${name}/releases/tag/${version}`;
  },
  async getRepository(name, url) {
    if (url.startsWith("cdn.jsdelivr.net/gh")) {
      return `https://github.com/${name}`;
    }

    const res = await fetch(`https://registry.npmjs.org/${name}`);

    if (!res.ok) {
      return undefined;
    }

    const json = await res.json();

    return json.versions[json["dist-tags"].latest].repository.url.replace(
      "git+",
      "",
    ).replace(".git", "");
  },
});
