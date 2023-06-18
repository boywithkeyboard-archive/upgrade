import { Registry } from "../Registry.ts";

export const GITHUB = new Registry({
  name: "raw.githubusercontent.com",
  getName(url) {
    return url.split("/")[1] + "/" + url.split("/")[2]; // org/repo
  },
  getCurrentVersion(url) {
    return url.split("/")[3];
  },
  async getNextVersion(name) {
    const res = await fetch(`https://api.github.com/repos/${name}/releases`);

    if (!res.ok) {
      throw new Error("raw.githubusercontent.com fetch error");
    }

    return (await res.json())[0].tag_name;
  },
  getCurrentVersionUrl(name, version) {
    return `https://github.com/${name}/releases/tag/${version}`;
  },
  getNextVersionUrl(name, version) {
    return `https://github.com/${name}/releases/tag/${version}`;
  },
  getRepository(name) {
    return `https://github.com/${name}`;
  },
});
