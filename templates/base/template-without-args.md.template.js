// prettier-ignore
const template = ({foo = [], bar = []}) => 
`This is a template that will not be completed by any other file.

This means the following lines should be empty:
\`\`\`
${foo.join(',')}
${bar.join(',')}
\`\`\``

export default template;
