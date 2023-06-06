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

## Possible improvements

### Use .json files
self explanatory

### Use .ts files
We could have a step during compile time where we traverse the `templates/` folder and generate types and the extension tree.

In that scenario I imagine someone would add a new extension by adding a folder within `templates/` with the optional `config.ts` file. Then run a script like `yarn update-extensions`, which does the traverse generating two files:
 - `src/extension-types.ts` with the right types
 - `src/utils/extension-tree.ts` with the tree ready to export without having to traverse the filesystem during runtime.

I've seen this approach being used in [Prisma](2).

[1]: https://github.com/nextauthjs/next-auth
[2]: https://www.prisma.io/