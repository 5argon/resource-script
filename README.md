# resource-script

Resource Script proposes a new programmer-centric data storage format and a code to parse it. After parsing, you get an abstract syntax tree (AST) to do whatever you want.

I didn't invent any syntax or parser, it is essentially just TypeScript-as-a-data. I just shamelessly piggybacked the `typescript` [Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) and use it to parse the script as a data storage.

Resource files can prevent hard-coding strings into your code and help with localization by simply swapping the file. For example .NET's [`resx` file](https://docs.microsoft.com/en-us/dotnet/framework/resources/creating-resource-files-for-desktop-apps) or Android's [XML String Resource file](https://developer.android.com/guide/topics/resources/string-resource). It could be as simple as `.json`, `.csv`, or even `.txt` file. Each one has its advantages and disadvantages trade-offs in authoring, features, and flexibility.

## Features

It may seems strange at first to use code as a resource. This section describes some advantages I found.

If you go read the [definition and motivation of JSON](https://www.json.org/), this Resource Script is following the same pattern except you replace JavaScript subset thing with TypeScript. Unlike JSON, Resource Script is actually a valid TypeScript code (though there is no reason to use it as a code). But unlike an actual code, **language elements are used literally as a part of string resource**.

For example, the object keys acts as the string resource's hierarchical keys. The arrow function parameter names and type notations which used to not really exist in real TypeScript, here they are interpreted meaningfully by the parser.

We "borrow" the TypeScript language server to help us write an easy to maintain resource file. CSV is no longer the only format with a "dedicated editor". With Typed String Resource, your code editor is the ideal editor. We gain an entire ecosystem of editor plugins used to work with TypeScript as well when our resource is exactly TypeScript like this. (e.g. `eslint`, `prettier`, etc.)

### Hierarchical keys

String keys used to access the resource are hierarchical, similar to JSON. Unlike JSON, you don't need double quotes on the keys. Some other format like CSV may use `.` or `/` as a hierarchy to index into the data, but it is just an illusion as `a.x` and `a.y` are 2 different keys with no relationship.

XML style resource file can also design a hierarchy, but personally I would love to author with this code-like syntax.

The parser gives you all the parent's key leading to that key automatically. You can do whatever you want with them.

-   Join all parent keys into a single string to use with other systems that does not understand hierarchy. Reduce naming conflict when you only need to focus on getting the key unique among the siblings.
-   Unlike JSON, TypeScript checker will warn you if you define duplicated keys among the siblings. It is essentially an object declaration and you can't have duplicated key.

### Comments as metadata

Add comments to any resource node by typing JSDoc style comment (`/** */`) above. (It won't work with just `//` becuase it won't "bound" to the code.) This make all resource node of Resource Script a tuple with an optional auxillary string storage by default.

It is increasingly important, for example when you are making resource for internationalization and needed to give context to the translators for each terms. The comment is a great feature prevalent in coding but not used much as a resource. (XML has comments, but often it does not count as an actual data.)

Some text editor can then show or hide comments, improving editing experience and you no longer fear of typing long comments.

### Great editing experience with TypeScript

-   You can get syntax highlighting from code editor to help authoring it. Number and strings are colored differently. You can see placeholder variable in the template literal clearly.
-   You get error checking by your code editor.
-   Possible to use toolings like `prettier` or `eslint` to easily format the resource content.

### Templating with arrow functions

Instead of using curly brackets with hard-coded strings, it uses JavaScript template literal dollar sign syntax instead. There is one added dollar sign as a bit of noise, but the string inside is now checked by the code editor.

-   It is impossible to mistype template literal since it is defined as an argument token on the arrow function.
-   Renaming the template variable is easy if you use rename feature in your code editor.
-   Possible to put a function inside that each argument is type safe. The function inside template literal can design something like [ICU transforms](https://unicode-org.github.io/icu/userguide/transforms/general/) where you need to provide "logic", all encoded as a string, which would be quite stressful if the case is complex.

### Resource hierarchy spanning multiple files with imports

Each file is a TypeScript module with a single `default` export. You can continue the hierarchy in an another Resource Script file. The parsed result will count as if the term has common parent. This make the resource file scalable, where in some other solutions each file is on its own.

-   Since imports are real TypeScript tokens, you can also use "Go To Definition" in your editor to quickly jump to the target file and back. Giving you more incentive to split files because in other solutions you may not want to navigate on the browser too much.
-   Similarly you can come back by using "Find All References". When there is only 1 reference which is usually the case, you can also do "Go To Definition" to jump back by most modern editors.
-   Though not so useful, you can use imports in different place and the result will be as if they are different leaves. Hierarchical keys took care of any key duplication problems when you do this.

WARNING : Please avoid import cycle, it **will** cause infinite loop. (PR welcome!)

## Conventions

-   Many TypeScript features will have no effect on the parser provided or even throws error, but there is no editor plugin or anything that treats them as an error. Please avoid doing that on your own.
-   Name the file as `___.rs.ts` to make it clear that this is not actually a code.

## Parsing into an Abstract Syntax Tree (AST)

Resource file would not be of any use without a parser. The parser is essentially just using `typescript` [Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API). This is the only export from this package :

```ts
function parse(filePath: string): Ast
```

When traversing the returned `Ast` object in TypeScript, provided type guards will be useful. (This is similar pattern to the TypeScript's Compiler API.)

I didn't write any documentation on the shape of the returned object yet but it should be fairly straightforward to learn from the `interface.ts` file. Type guards can also be learned from `type-guards.ts` file. Also of course the test file will show a usage from package consumer's perspective.
