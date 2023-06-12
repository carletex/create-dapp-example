import { Options } from "../types";
import fs, { stat } from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import { baseDir } from "../utils/consts";
import { mergePackageJson } from "../utils/merge-pacakge-json";
import { extensionDict } from "../utils/extensions-tree";

const copy = promisify(ncp);

const isTemplateRegex = /\.template\./;
const isConfigRegex = /config\.(ts|js)/;
const isArgsRegex = /\.args\./;
const isExtensionFolderRegex = /extensions$/;
const copyExtensionsFiles = async (
  { extensions }: Options,
  targetDir: string
) => {
  extensions.forEach(async (extension) => {
    const extensionPath = extensionDict[extension].path;
    // copy root files
    await copy(extensionPath, path.join(targetDir), {
      clobber: false,
      filter: (path) => {
        const isConfig = isConfigRegex.test(path);
        const isArgs = isArgsRegex.test(path);
        const isExtensionFolder =
          isExtensionFolderRegex.test(path) && fs.lstatSync(path).isDirectory();
        const isTemplate = isTemplateRegex.test(path);
        const shouldSkip =
          isConfig || isArgs || isTemplate || isExtensionFolder;
        return !shouldSkip;
      },
    });

    // merge root package.json
    mergePackageJson(
      path.join(targetDir, "package.json"),
      path.join(extensionPath, "package.json")
    );

    const extensionPackagesPath = path.join(extensionPath, "packages");
    const hasPackages = fs.existsSync(extensionPackagesPath);
    if (hasPackages) {
      // copy extension packages files
      await copy(extensionPackagesPath, path.join(targetDir, "packages"), {
        clobber: false,
      });

      // copy each package's package.json
      const extensionPackages = fs.readdirSync(extensionPackagesPath);
      extensionPackages.forEach((packageName) => {
        mergePackageJson(
          path.join(targetDir, "packages", packageName, "package.json"),
          path.join(extensionPath, "packages", packageName, "package.json")
        );
      });
    }
  });
};

export async function copyTemplateFiles(
  options: Options,
  templateDir: string,
  targetDir: string
) {
  // 1. Copy base template to target directory
  const basePath = path.join(templateDir, baseDir);
  await copy(basePath, targetDir, {
    clobber: false,
    filter: (fileName) => !isTemplateRegex.test(fileName), // NOTE: filter IN
  });

  // 2. Copy extensions folders
  copyExtensionsFiles(options, targetDir);
}
