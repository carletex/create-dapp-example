import {
  availableExtensions,
  HandleBarTemplateOptions,
  Options,
} from "../types";
import fs, { stat } from "fs";
import Handlebars from "handlebars";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";
import {
  baseDir,
  extensionsDir,
  handleBarsTemplateFiles,
  solidityFrameworksDir,
} from "../utils/consts";
import { constructYarnWorkspaces } from "../utils/construct-yarn-workspaces";
import { constructHandleBarsTargetFilePath } from "../utils/construct-handlebars-target-file-path";
import { copySolidityFrameWorkDir } from "../utils/copy-solidityFramworks";
import { mergePackageJson } from "../utils/merge-pacakge-json";
import { constructAppFile } from "../utils/construct-next-app-file";
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
        const shouldSkip = isConfig || isArgs || isExtensionFolder;
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

// Process template files
const processAndCopyTemplateFiles = async (
  options: Options,
  templateDir: string,
  targetDir: string
) => {
  // Copy non conflicting files
  if (!options.extensions.includes("none")) {
    options.extensions.forEach((extension) => {
      const extensionsBaseDir = path.join(
        templateDir,
        extensionsDir,
        extension
      );
      // copy packages dir
      copy(
        path.join(extensionsBaseDir, "packages"),
        path.join(targetDir, "packages"),
        { clobber: false }
      );

      const extensionNextjsDir = path.join(extensionsBaseDir, "nextjs");

      const readAllRootFiles = fs.readdirSync(extensionNextjsDir);
      readAllRootFiles.forEach((name) => {
        const stats = fs.statSync(path.join(extensionNextjsDir, name));
        if (stats.isDirectory()) {
          const targetNextjsDir = path.join(targetDir, "packages", "nextjs");
          copy(
            path.join(extensionNextjsDir, name),
            path.join(targetNextjsDir, name),
            {
              clobber: false,
            }
          );
        }
      });
    });
  }

  handleBarsTemplateFiles.forEach((templateFile) => {
    // eg : templateFile = base/package.json.hbs

    // base/package.json.hbs -> base/package.json
    const targetFile = templateFile.replace(".hbs", "");
    const templateFilePath = path.join(templateDir, templateFile);

    const targetFilePath = path.join(
      targetDir,
      // targetDir/base/package.json needs to be converted to targetDir/package.json
      constructHandleBarsTargetFilePath(targetFile)
    );
    const templateContent = fs.readFileSync(templateFilePath, "utf8");
    const template = Handlebars.compile<HandleBarTemplateOptions>(
      templateContent,
      {
        noEscape: true,
      }
    );

    const yarnWorkspaces = constructYarnWorkspaces(options, templateDir);
    const {
      _appImports,
      _appOutsideComponentCode,
      _appProviderWrappers,
      _appProvidersClosingTags,
    } = constructAppFile(options, templateDir);

    const result = template({
      ...options,
      yarnWorkspaces,
      _appImports,
      _appOutsideComponentCode,
      _appProviderWrappers,
      _appProvidersClosingTags,
    });

    fs.writeFileSync(targetFilePath, result, "utf8");
  });
};

const mergeExtensionsPackageJson = async (
  options: Options,
  templateDir: string,
  targetDir: string
) => {
  if (options.extensions.includes("none")) return;

  options.extensions.forEach((extension) => {
    // eg : extension = graph
    // extensionBaseDir = templateDir/extensions/graph
    const extensionsBaseDir = path.join(templateDir, extensionsDir, extension);

    // merge package.json from extensions nextjs to targetDir nextjs pacakge.json
    mergePackageJson(
      path.join(targetDir, "packages", "nextjs", "package.json"),
      path.join(extensionsBaseDir, "nextjs", "package.json")
    );

    // merge root pacakge json for scripts of extensions
    mergePackageJson(
      path.join(targetDir, "package.json"),
      path.join(extensionsBaseDir, "package.json")
    );
  });
};

async function mergeSolidityFrameWorksPackageJson(
  options: Options,
  templateDir: string,
  targetDir: string
) {
  if (options.smartContractFramework === "none") return;

  // Also merge root package.json for scripts of solidityFrameworks
  const solidityFrameworkRootPackageJson = path.join(
    templateDir,
    solidityFrameworksDir,
    options.smartContractFramework.toLowerCase(),
    "package.json"
  );

  mergePackageJson(
    path.join(targetDir, "package.json"),
    solidityFrameworkRootPackageJson
  );
}

export async function copyTemplateFiles(
  options: Options,
  templateDir: string,
  targetDir: string
) {
  // 1. Copy base template to target directory
  const basePath = path.join(templateDir, baseDir);
  const isTemplateRegex = /\.template\./;
  await copy(basePath, targetDir, {
    clobber: false,
    filter: (fileName) => !isTemplateRegex.test(fileName), // NOTE: filter IN
  });

  // 2. Copy extensions folders
  copyExtensionsFiles(options, targetDir);

  // 3. Copy smart contract framework folder if selected.(This function only copies non conflicting files like `packages` dir)
  // await copySolidityFrameWorkDir(options, templateDir, targetDir);

  // 4. Process template files, depending on enabled extensions
  // await processAndCopyTemplateFiles(options, templateDir, targetDir);

  // mergeSolidityFrameWorksPackageJson(options, templateDir, targetDir);

  // mergeExtensionsPackageJson(options, templateDir, targetDir);
}
