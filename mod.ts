import {
  brightBlue,
  brightGreen,
  brightYellow,
  gray,
} from "https://deno.land/std@0.192.0/fmt/colors.ts";
import { Checkbox, colors, parseArgs } from "./deps.ts";
import { difference } from "./difference.ts";
import { upgrade } from "./upgrade.ts";

if (import.meta.main) {
  const args = parseArgs(Deno.args);

  const directory = args.d ?? args.directory;
  const extensions = args.e ?? args.extensions;
  const allowBreaking = args.b ?? args["allow-breaking"];
  const allowUnstable = args.u ?? args["allow-unstable"];

  console.info(gray(`${brightYellow("wait")} - fetching updates`));

  let changes = await difference({
    directory,
    extensions,
    allowBreaking,
    allowUnstable,
  });

  const filteredChanges: Record<string, {
    registryName: string;
    currentVersion?: string;
    nextVersion?: string;
    reason?: string;
    type: string;
  }> = {};

  for (const c of changes) {
    const obj = filteredChanges[c.moduleName];

    if (!obj) {
      filteredChanges[c.moduleName] = {
        registryName: c.registryName,
        currentVersion: c.currentVersion,
        nextVersion: c.nextVersion,
        reason: c.reason,
        type: c.type,
      };
    } else if (c.type === "upgrade") {
      if (c.currentVersion) {
        filteredChanges[c.moduleName].currentVersion = c.currentVersion;
      }

      if (c.nextVersion) {
        filteredChanges[c.moduleName].nextVersion = c.nextVersion;
      }

      if (c.registryName) {
        filteredChanges[c.moduleName].registryName = c.registryName;
      }

      filteredChanges[c.moduleName].reason = undefined;

      filteredChanges[c.moduleName].type = c.type;
    }
  }

  if (
    Object.entries(filteredChanges).some((c) => {
      return c[1].type === "upgrade" &&
        c[1].currentVersion !== c[1].nextVersion;
    })
  ) {
    const submittedChanges: string[] = await Checkbox.prompt({
      message: colors.stripColor("Can you confirm the changes?"),
      options: Object.entries(filteredChanges).map(([key, value]) => {
        return {
          name: `${key} × ${value.currentVersion}${
            value.nextVersion && value.type === "upgrade"
              ? ` → ${value.nextVersion}`
              : ""
          }${
            value.type === "fail"
              ? " (failed)"
              : value.type === "skip"
              ? " (skipped)"
              : ""
          }`,
          value: `${value.registryName}:${key}`,
          checked: value.nextVersion && value.type === "upgrade" ? true : false,
          disabled: value.type === "fail" || !value.nextVersion ||
            value.reason === "same",
        };
      }),
    });

    changes = changes.filter((c) => {
      return submittedChanges.includes(`${c.registryName}:${c.moduleName}`);
    });

    if (changes.length > 0) {
      await upgrade(changes);

      const files: string[] = [];

      for (const change of changes) {
        if (!files.includes(change.filePath)) {
          files.push(change.filePath);
        }
      }

      console.info(
        gray(`${brightGreen("success")} - updated ${files.length} files`),
      );
    }
  } else {
    console.info(
      gray(`${brightBlue("info")} - no updates available`),
    );
  }
}
