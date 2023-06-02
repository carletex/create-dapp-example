import config from "../config";
import {
  ExtensionDescriptor,
  Options,
  RawOptions,
  extensionIsBranch,
  isDefined,
} from "../types";
import inquirer, { Answers } from "inquirer";
import { getExtensionsTree } from "./exensions-tree";

// default values for unspecified args
const defaultOptions: Omit<Options, "extensions"> = {
  project: "my-dapp-example",
  smartContractFramework: "hardhat",
  install: true,
};

export async function promptForMissingOptions(
  options: RawOptions
): Promise<Options> {
  const cliAnswers = options;
  const questions = [];
  const extensionsTree = getExtensionsTree();

  questions.push({
    type: "input",
    name: "project",
    message: "Your project name:",
    default: defaultOptions.project,
    validate: (value: string) => value.length > 0,
  });

  const recurringAddFollowUps = (
    extensions: ExtensionDescriptor[],
    relatedQuestion: string
  ) => {
    extensions.filter(extensionIsBranch).forEach((ext) => {
      const nestedExtensions = ext.extensions;
      questions.push({
        // INFO: assuming nested extensions are all optional. To change this,
        // update ExtensionDescriptor adding type, and update code here.
        type: "checkbox",
        name: `${ext.value}-extensions`,
        message: `Select optional extensions for ${ext.name}`,
        choices: nestedExtensions,
        when: (answers: Answers) => {
          const relatedResponse = answers[relatedQuestion];
          const wasMultiselectResponse = Array.isArray(relatedResponse);
          return wasMultiselectResponse
            ? relatedResponse.includes(ext.value)
            : relatedResponse === ext.value;
        },
      });
      recurringAddFollowUps(nestedExtensions, `${ext.value}-extensions`);
    });
  };

  config.questions.forEach((question) => {
    const extensions = question.extensions
      .map((ext) => extensionsTree[ext])
      .filter(isDefined);

    questions.push({
      type: question.type === "multi-select" ? "checkbox" : "list",
      name: question.name,
      message: question.message,
      choices: extensions,
    });

    recurringAddFollowUps(extensions, question.name);
  });

  questions.push({
    type: "confirm",
    name: "install",
    message: "Install packages?",
    default: defaultOptions.install,
  });

  const answers = await inquirer.prompt(questions, cliAnswers);

  return {
    smartContractFramework:
      options.smartContractFramework ?? answers.smartContractFramework,
    project: options.project ?? answers.project,
    extensions: answers.extensions,
    install: options.install ?? answers.install,
  };
}
