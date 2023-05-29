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
