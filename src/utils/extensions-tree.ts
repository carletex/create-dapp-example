import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { Extension, ExtensionDescriptor, ExtensionDict } from "../types";

export const extensionDict: ExtensionDict = {} as ExtensionDict;

const currentFileUrl = import.meta.url;

const templatesDirectory = path.resolve(
  decodeURI(fileURLToPath(currentFileUrl)),
  "../../templates"
);

/**
 * This function has side effects. It generates the extensionDict.
 *
 * @param basePath the path at which to start the traverse
 * @returns the extensions found in this path. Useful for the recursion
 */
const traverseExtensions = async (basePath: string): Promise<Extension[]> => {
  const extensionsPath = path.resolve(basePath, "extensions");
  let extensions: Extension[];
  try {
    extensions = fs.readdirSync(extensionsPath) as Extension[];
  } catch (error) {
    return [];
  }

  await Promise.all(
    extensions.map(async (ext) => {
      const extPath = path.resolve(extensionsPath, ext);
      const configFile = fs
        .readdirSync(extPath)
        .find((fileOrFolder) => /^config\.(js|ts)$/.test(fileOrFolder));
      let name = ext;
      let value = ext;
      if (configFile) {
        const extConfigPath = path.resolve(extPath, configFile);
        const extConfig = await import(extConfigPath).catch((err) => {
          console.log("importing", extConfigPath);
          if ((err.code = "ERR_MODULE_NOT_FOUND")) {
            console.log(err);
          }
        });
        name = extConfig.name ?? ext;
        value = extConfig.value ?? ext;
      }

      const subExtensions = await traverseExtensions(extPath);
      const hasSubExtensions = subExtensions.length !== 0;
      const extDescriptor: ExtensionDescriptor = {
        name,
        value,
        path: extPath,
        extensions: subExtensions,
      };
      if (!hasSubExtensions) {
        delete extDescriptor.extensions;
      }
      extensionDict[ext] = extDescriptor;

      return subExtensions;
    })
  );

  return extensions;
};

await traverseExtensions(templatesDirectory);
