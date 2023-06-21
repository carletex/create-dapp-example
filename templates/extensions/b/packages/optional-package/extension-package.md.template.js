import { withDefaults } from "../../../../utils.js";

// prettier-ignore
const bOptionalTemplate = ({ named = []}) =>
`Existing text. Extra content below.

${named.join("\n")}
`;

export default withDefaults(bOptionalTemplate, ["named"]);
