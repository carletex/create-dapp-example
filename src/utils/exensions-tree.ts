import {
  ExtensionDescriptor,
  ExtensionLeaf,
  ExtensionTree,
  extensionIsBranch,
  isDefined,
} from "../types";

// TODO this should be generated based on the /templates folder structure
export const getExtensionsTree = (): ExtensionTree => ({
  a1: {
    name: "A1",
    value: "a1",
  },
  a2: {
    name: "A2",
    value: "a2",
    extensions: [
      {
        name: "Extension for A2",
        value: "a2-a",
      },
    ],
  },
  a3: {
    name: "A3",
    value: "a3",
  },
  b: {
    name: "optional B",
    value: "b",
    extensions: [
      {
        name: "B Extension 1",
        value: "b-extension1",
        extensions: [{ name: "nested b1", value: "bb1" }],
      },
      {
        name: "B Extension 2",
        value: "b-extension2",
        extensions: [{ name: "nested b2", value: "bb2" }],
      },
    ],
  },
  c: {
    name: "optional C",
    value: "c",
  },
  d: {
    name: "optional D",
    value: "d",
  },
});

export const expandExtensionsWithNesting = (
  extensions: (ExtensionDescriptor | undefined)[],
  depth = 0
): ExtensionLeaf[] => {
  return extensions
    .filter(isDefined)
    .flatMap((ext: ExtensionDescriptor) =>
      [
        { name: "\t".repeat(depth) + ext.name, value: ext.value },
        extensionIsBranch(ext)
          ? expandExtensionsWithNesting(ext.extensions, depth + 1)
          : undefined,
      ]
        .filter(isDefined)
        .flat()
    );
};
