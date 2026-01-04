import * as fs from "fs";

export const readFileContent = (filePath: string): string => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
};
