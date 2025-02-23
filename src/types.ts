export const smartContractFrameworks = ["hardhat", "foundry", "none"] as const;
export const availableExtensions = ["graph", "another"] as const;

export type Args = string[];

export type Template = (typeof smartContractFrameworks)[number];
export type Extensions = (typeof availableExtensions)[number];

export type RawOptions = {
  smartContractFramework?: Template;
  project: string;
};

export type Options = RawOptions & {
  extensions: Extensions[];
  smartContractFramework: Template;
};
