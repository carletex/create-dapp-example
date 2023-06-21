import { withDefaults } from "../../utils.js";

// prettier-ignore
const bRootTemplate = ({ namedArgument = []}) => 
`This is the initial content for b-root_template.md, but other extensions can add content below
${namedArgument.join("\n")}

---
And this was also in b-root_template.md initially.`;

export default withDefaults(bRootTemplate, ["namedArgument"]);
