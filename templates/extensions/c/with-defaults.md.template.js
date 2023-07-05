import { withDefaults } from "../../utils.js";

export const expectedArgs = ["one", "two"];
// prettier-ignore
const template = ({one, two}) =>
`This is the value of one: ${one}
And the value of two: ${two}`

export default withDefaults(template, expectedArgs);
