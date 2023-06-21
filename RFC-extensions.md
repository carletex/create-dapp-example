I propose we treat anything other than "base" as an extension. That way we don't need to make distinctions between solidity frameworks or any other kind of extension.

This change should make it easier to grow the options we provide our users without having to classify extensions by category.

This change requires a new file, `src/config.ts`, where a few things about the extensions are defined, e.g. the sequence of questions about extensions.

In this way, we can add extensions of extensions, just by adding an `/extensions` folder inside an existing extension. For example, adding [next-auth][1] as an extension for next would look something like the following:

```text
create-dapp-example/
├─ src/
│  ├─ ...
│
├─ templates/
│  ├─ base/
│  ├─ extensions/
│  │  ├─nextjs
│  │  ├─ ...
│  │  ├─ extensions/
│  │  │  ├─ next-auth/
│  │  │  ├─ ...
```

# Config files
There's one main `src/config.ts` file to configure the questions shown to the user.

For each extension there is an optional `templates/extensions/{extensionName}/config.js` file providing information about the specific extension.

| ⚠️ Note how the extension config file is a JavaScript file, not TS!

The reason we need to use .js files for these is because those files are imported at runtime by the node executable.

## Config files API
### `src/config.ts`
Have a look at `src/types.ts#Config`

### `{extension}/config.*`
Since these files can't be .ts (for now, see [Possible improvements](#possible-improvements)), the API is not typed.

The values that can be exported from these files are:
 - `name`: the string to be used when showing the package name to the user via the cli

| Note that all values are optional, as well as the file itself.

## Possible improvements

### Use .json files
self explanatory

### Use .ts files
One option to investigate is using ts-node. I haven't done any research on this path, but it might be an interesting option.

Another alternative to use .ts files is to add a step during compile time where we traverse the `templates/` folder and generate types and the extension tree.

In that scenario I imagine someone would add a new extension by adding a folder within `templates/` with the optional `config.ts` file. Then run a script like `yarn update-extensions`, which does the traverse generating two files:
 - `src/extension-types.ts` with the right types
 - `src/utils/extension-tree.ts` with the tree ready to export without having to traverse the filesystem during runtime.

I've seen this approach being used in [Prisma](2).

# Template files
A Template file is a file to which extensions can add content. Removing content is out of scope for this experiment.

## Template files API
### Template file name
All Template file should be named as \`{original-name.with-extension}.template.js\`. This way we can skip those files while copying base and extensions, and process them with the values from the base and the combined extensions.

### Template file contents
All Template files should export default a function receiving named arguments and returning a string where those input arguments can be used to do string interpolation.

Given multiple extensions can write to the same templates, each of the name argument should expect to receive an array of strings. Note the array might potentially be empty, which would mean no extension is adding values to that template.

The values from each file writing to the template are placed in the array in the same order the user selected the extensions. This effectively means nested extensions write last.

Therefore the signature should always be \`(Record<string, string[]>) => string\`

Also, receiving an array instead of strings give the template itself more control over the final output. Like how the different values should be joined.

Important to note that named arguments could use any arbitrary name. Because of that, we have to provide default values to all those arguments, otherwise missing values would be parsed as the string "undefined". Because we don't know what are the expected names for each template expects.

## Things to note about Template files
### Default values
It's a bit annoying having to define an empty array as a default value for all the arguments. To solve this, I've created a utility function that receives the template and expected arguments, and takes care of it.

### Unwanted new lines
Note when you use backticks, "`", to create interpolated strings, new lines are taken as part of the string. Therefore the following string would start and end with extra empty lines:
```ts
const stringWithNewLines = `
woops, there are new lines
`
```

You can do the following:
```ts
const stringWithoutNewLines =
`This string starts without a new line
and ends without new lines`
```

If you do this, however, prettier will try to indent the backtick. To avoid that you can see I've added a bunch of `// prettier-ignore`s before the template strings.

# Args files
Args files are the files used to add content to Template files.

## Args files API
### Args file name
All Args files should be named as \`{original-name.with-extension}.args.js\`. This way we can check, for a given Template file, if any Args files exist.

Important to note here that the relative path of the Template and Args files **must** be the same. Otherwise the Args file content won't be used. By relative path I mean the path relative to the `base/` path or the `extensions/{extension-name}/` paths. An example:
```
create-dapp-example/
├─ ...
│
├─ templates/
│  ├─ base/
│  │  ├─ some-folder/
│  │  │  ├─ template-at-folder.md.template.js
│  │  ├─ template-at-root.md.template.js
│  │
│  ├─ extensions/
│  │  ├─ foo/
│  │  │  ├─ some-folder/
│  │  │  │  ├─ template-at-root.md.template.js <-- won't work!
│  │  │  │  ├─ template-at-folder.md.template.js
│  │  │  ├─ template-at-root.md.template.js
│  │  │  ├─ template-at-folder.md.template.js <-- won't work!
```

### Args file content

# Args files injection in Template files
For each Template file, we search on the extensions the user selected for the existence of Args files in the exact same relative path. If there are multiple Args files, we combine them into an array

I've thought about how the strings should be joined, but an option is to use [tagged templates](4). We can go as crazy as we want with tagged templates.

# Extension folder anatomy
TODO write this section

# Things worth mentioning
## Merging package.json files
The package we use to merge package.json files [merge-packages](3) will use the last version of a dependency given a conflict. For example:
```
version on file one: 1.0.0
version on file two: 0.1.0
resulting version: 0.1.0

version on file one: 0.1.0
version on file two: 1.0.0
resulting version: 1.0.0
```
The first and last files are the first and second arguments when we call the function, so we can choose what version we want to win when there's a conflict.

## Filesystem async methods
This is a possible improvement in the speed of the cli. I've used the sync API to avoid adding extra complexity for the proof of concept, but it might be an improvement helping parallelize tasks. For example processing templates in parallel.


[1]: https://github.com/nextauthjs/next-auth
[2]: https://www.prisma.io/
[3]: https://github.com/zppack/merge-packages
[4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates