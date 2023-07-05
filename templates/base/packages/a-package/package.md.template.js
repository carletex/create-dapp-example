import { withDefaults } from "../../../utils.js";

const expectedArgs = ["named"];
// prettier-ignore
const aPackageTemplate = ({ named }) =>
`Template for a-package written from base

extra content below:
${named.join("\n")}
`;

export default withDefaults(aPackageTemplate, expectedArgs);
