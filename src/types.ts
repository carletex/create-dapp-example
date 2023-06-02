import type { Question } from "inquirer";

export const smartContractFrameworks = ["hardhat", "none"] as const;
export const availableExtensions = ["graph", "none"] as const;

export type Args = string[];

export type Template = (typeof smartContractFrameworks)[number];

export type Extensions = (typeof availableExtensions)[number];

export type RawOptions = {
  smartContractFramework: Template | null;
  project: string | null;
  install: boolean | null;
};

type NonNullableRawOptions = {
  [Prop in keyof RawOptions]: NonNullable<RawOptions[Prop]>;
};

export type Options = NonNullableRawOptions & {
  extensions: Extensions[];
  smartContractFramework: Template;
};

export type templateAppConfig = {
  _appImports: string[];
  _appOutsideComponentCode: string;
  _appProviderWrappers: string[];
};

export type HandleBarTemplateOptions = Options & {
  yarnWorkspaces: `packages/${string}`[];
  _appImports: string[];
  _appOutsideComponentCode: string[];
  _appProviderWrappers: string[];
  _appProvidersClosingTags: string[];
};

export type Extension = "a1" | "a2" | "a3" | "b" | "c" | "d" | "b-extension";
// corresponds to inquirer question types:
//  - multi-select -> checkbox
//  - single-select -> list
type QuestionType = "multi-select" | "single-select";
interface ExtensionQuestion<T extends Extension[] = Extension[]> {
  type: QuestionType;
  extensions: T;
  name: string;
  message: Question["message"];
  default?: T[number];
}

/**
 * This function makes sure that the `T` generic type is narrowed down to
 * whatever `extensions` are passed in the question prop. That way we can type
 * check the `default` prop is not using any valid extension, but only one
 * already provided in the `extensions` prop.
 *
 * Questions can be created without this function, just using a normal object,
 * but `default` type will be any valid Extension.
 */
export const typedQuestion = <T extends Extension[]>(
  question: ExtensionQuestion<T>
) => question;
export type Config = {
  questions: ExtensionQuestion[];
};

export const isDefined = <T>(item: T | undefined | null): item is T =>
  item !== undefined && item !== null;

export type ExtensionLeaf = { name: string; value: string };
export type ExtensionBranch = ExtensionLeaf & {
  extensions: ExtensionDescriptor[];
};
export type ExtensionDescriptor = ExtensionLeaf | ExtensionBranch;
export type ExtensionTree = {
  [extension in Extension]?: ExtensionDescriptor;
};

export const extensionIsBranch = (
  extension: ExtensionDescriptor | undefined
): extension is ExtensionBranch => {
  return Object.prototype.hasOwnProperty.call(extension, "extensions");
};
