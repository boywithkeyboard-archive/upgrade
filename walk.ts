import { fs } from "./deps.ts";
import { registries } from "./registries.ts";
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

        if (registries.some((r) => url === `https://${r.prefix}`)) {
          continue;
        }

        const registry = registries.filter((r) =>
          url.startsWith(`https://${r.prefix}`)
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
