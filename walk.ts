import { fs } from "./deps.ts";
import { registries } from "./registries/mod.ts";
import { urlRegex } from "./urlRegex.ts";

export async function* walk(directory: string, extensions: string[]) {
  for await (const { path, isFile } of fs.walk(directory)) {
    try {
      if (!isFile || !extensions.some((e) => path.endsWith(`.${e}`))) {
        continue;
      }

      const content = await Deno.readTextFile(path);

      const urls = content.match(urlRegex);

      if (!urls) {
        continue;
      }

      for (let url of urls) {
        url = url.replaceAll("'", "").replaceAll('"', "").replace(")", "");

        if (registries.some((r) => url === r.urlPrefix)) {
          continue;
        }

        const registry = registries.filter((r) =>
          url.startsWith(r.urlPrefix)
        )[0];

        if (
          url.includes("${") ||
          !registry
        ) {
          continue;
        }

        url = url.replace("https://", "");

        yield {
          path,
          registry,
          url,
        };
      }
    } catch (_) {
      continue;
    }
  }
}
