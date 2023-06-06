import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import {
  ExtensionDescriptor,
  ExtensionTree,
  extensionIsBranch,
  isDefined,
} from "../types";

let cachedExtensionTree: ExtensionTree | null = null;

const traverseExtensions = async (basePath: string): Promise<ExtensionTree> => {
  const extensionsPath = path.resolve(basePath, "extensions");
  let extensions;
  try {
    extensions = fs.readdirSync(extensionsPath);
  } catch (error) {
    return {};
  }
  const extensionEntries = await Promise.all(
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
      const hasSubExtensions = Object.entries(subExtensions).length !== 0;
      const extDescriptor: ExtensionDescriptor = {
        name,
        value,
        extensions: Object.values(subExtensions),
      };
      if (!hasSubExtensions) {
        delete extDescriptor.extensions;
      }

      return [value, extDescriptor];
    })
  );

  const tree = Object.fromEntries(extensionEntries);
  return tree;
};

const generateExtensionTree = async (): Promise<ExtensionTree> => {
  const currentFileUrl = import.meta.url;

  const templatesDirectory = path.resolve(
    decodeURI(fileURLToPath(currentFileUrl)),
    "../../templates"
  );

  const tree = await traverseExtensions(templatesDirectory);

  cachedExtensionTree = tree;
  return tree;
};

export const getExtensionsTree = async (): Promise<ExtensionTree> =>
  cachedExtensionTree ?? generateExtensionTree();
