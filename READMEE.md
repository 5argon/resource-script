# typed-string-resource

Resource files can prevent hard-coding strings into your code and help with localization by simply swapping the file. For example .NET's [`resx` file](https://docs.microsoft.com/en-us/dotnet/framework/resources/creating-resource-files-for-desktop-apps) or Android's [XML String Resource file](https://developer.android.com/guide/topics/resources/string-resource). It could be as simple as `.json`, `.csv`, or even `.txt` file. Each one has its advantages and disadvantages trade-offs in authoring, features, and flexibility.

`typed-string-resource` proposes a new programmer-centric file format for storing string resource, and a code to parse it. You get an abstract syntax tree (AST) to do whatever you want.

## Features

This resource file doubles as a valid TypeScript code. But unlike an actual code, many language elements are used creatively as a part of string resource. The object keys acts as the string resource's hierarchical keys. The arrow function parameter names doesn't really exist in real TypeScript program, same goes for all the typings, but here they are interpreted as strings. We "borrow" the language server to help us write a type checked resource file.

### Hierarchical keys

String keys usually used to access the terms in the string resource file in this format are hierarchical. Other solutions may use `.` or `/` as a hierarchy, but it is just an illusion as `a.x` and `a.y` are 2 different keys with no relationship in the end.

Notable design that can use hierarchical keys is JSON. But this has better syntax since the double quote is not required. XML style resource file can also design a hierarchy, but personally I would love to author with this syntax.

-   Reduce naming conflict when you only need to focus on getting the key unique inside the hierarchy. Also TypeScript will warn you since it is essentially an object declaration and you can't have duplicated key.
-   Real hierarchy allows you to mass-rename any middle part of the hierarchy easily.
-   You can use it to generate into flattened hierarchy with `.` or `/` joiners to interop with other systems that doesn't understand hierarchy.

### Comments as metadata

Add comments to any terms by typing them above. It is increasingly important when you are making resource for internationalization and needed to give context to the translators.

Some text editor can then show or hide comments, improving editing experience and you no longer fear of typing long comments.

### Great editing experience with TypeScript

-   You can get syntax highlighting from code editor to help authoring it.
-   You get error checking by your code editor.
-   Possible to use toolings like `prettier` or `eslint` to easily format the resource content.
-   Using `typescript` [Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) as a parser, it is extremely flexible as you can use many language tokens creatively as an actual, useful output.

### Templating with arrow functions

Instead of using curly brackets with hard-coded strings, it uses JavaScript template literal dollar sign syntax instead. There is one added dollar sign as a bit of noise, but the string inside is now checked by the code editor.

-   It is impossible to mistype template literal since it is defined as an argument token on the arrow function.
-   Renaming the template variable is easy if you use rename feature in your code editor.
-   Possible to put a function inside that each argument is type safe. The function inside template literal can design something like [ICU transforms](https://unicode-org.github.io/icu/userguide/transforms/general/) where you need to provide "logic", all encoded as a string, which would be quite stressful if the case is complex.

### Terms spanning multiple files with imports

Each file is a TypeScript module with a single `default` export. You can continue the hierarchy in an another Typed String Resource file. The parsed result will count as if the term has common parent. This make the resource file scalable, where in some other solutions each file is on its own.

Since imports are real TypeScript tokens, you can also use "Go To Definition" in your editor to quickly jump to the target file and back. Giving you more incentive to split files because in other solutions you may not want to navigate on the browser too much.

Though not so useful, you can use imports in different place and the result will be as if they are different leaves. Hierarchical keys took care of any key duplication problems when you do this.

## Conventions

-   Many TypeScript features will has no effect on the parser provided, but there is no editor plugin or anything that treats them as an error. Please avoid doing that on your own.
-   Name the file as `___.tsr.ts`.

## Abstract Syntax Tree

The parser is essentially just using `typescript` [Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API). This is the only export from this package :

### `typedStringResource.parse(files : string[]) : Ast`
