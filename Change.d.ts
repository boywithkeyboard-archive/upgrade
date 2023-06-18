export type Change = {
  moduleName: string;
  registryName: string;
  url: string;
  currentVersion?: string;
  nextVersion?: string;
  filePath: string;
  reason?: string;
  type: "upgrade" | "skip" | "fail";
};
