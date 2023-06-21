import { withDefaults } from "../utils.js";

// prettier-ignore
const baseTemplate = ({ namedArgument }) =>
`# A Template
This is an example file in the base directory.

The goal of this file is to illustrate how templates work.

A Template File is a file to which extensions can add content. Removing content is out of scope for this experiment.

# Template API
## Template file name
All Template File should be named as \`{originalName}.template.js\`.
This way we can skip those files while copying base and extensions, and process them with the values from the base and the combined extensions.

## Template file contents
All Template Files should export default a function receiving named arguments and returning a string where those input arguments can be used to do string interpolation.

Therefore the signature should always be \`(Record<string, string>) => string\`

Since this file is itself a Template File, any other extension should be able to write below:
\`\`\`
${namedArgument.join("\n")}
\`\`\`
`;

export default withDefaults(baseTemplate, ["namedArgument"]);
