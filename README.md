# resource-script

```ts
const valueStorage = {
  string: 'Hello',
  num: 555,
  stringArray: ['Hello', 'World'],
  numArray: [123, 456, 789],
  isIt: true,
  flags: [true, true, false],
}
export default valueStorage
```

Resource Script is a programmer-centric data storage format that **looks like** TypeScript code.

The package also provide a code written in TypeScript/JavaScript to parse and traverse the returned abstract syntax tree (AST) with Node.JS. You can use the provided type information and type guards to traverse the tree more easily.

It is essentially just TypeScript-as-a-data, I didn't invent any syntax or parser. Thanks to `typescript` [Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) the script file could double as a data storage. TypeScript is a language that is fun and fluid to model and link up relationship of various tokens you had typed. I would like to use it in more than its original programming purpose.

Name the file extension as `.rs.ts` to make it clear that this is not actually a code, yet still receive syntax highlighting and other toolings from TypeScript.

Some exmaple of "resource file" are .NET's [`resx` file](https://docs.microsoft.com/en-us/dotnet/framework/resources/creating-resource-files-for-desktop-apps) or Android's [XML String Resource file](https://developer.android.com/guide/topics/resources/string-resource). It could be as simple as `.json`, `.csv`, or even `.txt` file. Each one has its advantages and disadvantages trade-offs in editing experience, features, flexibility, and how difficult for machine to parse.

## Installation

```
yarn add -D resource-script
```

(It is likely that processing Resource Script is a development-only dependency.)

## Usage

Exported functions to programmatically parse a Resource Script file into `Ast` which you can loop through :

```ts
/**
 * Throw if the file is not found or malformed.
 */
export function parseFile(files: string): Ast

/**
 * Ignores any import statement.
 */
export function parseString(s: string): Ast
```

Using a bonus Node.JS command to turn Resource Script files into JSON file : [here](./documentation/to-json.md)

## Motivation

It may seems strange at first to use code as a resource. This section describes some advantages I found.

If you go read the [definition and motivation of JSON](https://www.json.org/), this Resource Script is following the same pattern (is based on a programming language) except you replace JavaScript subset thing with TypeScript.

Unlike JSON, Resource Script is actually a valid TypeScript code (though there is no reason to use it as a code). But unlike an actual code, **language elements are used literally as a part of string resource**. And many language tokens are helpful for attaching bell and whistles to your data. Ever wanted to "attach" a comment to a JSON object that is actually meaningful to the parser without making a key "comment"? Now it is a reality, you get a dedicated slot to add comments in many places.

We "borrow" the TypeScript language server to help us write an easy to maintain resource file. CSV is no longer the only format with a "dedicated editor". With Resource Script, your code editor is the ideal editor. We gain an entire ecosystem of editor plugins used to work with TypeScript as well when our resource is exactly TypeScript like this. (e.g. `eslint`, `prettier`, etc.)

## Weaknesses

Everyone building the next new thing claims they are lightweight. Resource Script is proudly **heavyweight**. Compared with JSON, it is more difficult for machine to parse (as evidence by the work of TypeScript team over the years) but easier for human to write with all the toolings already available. Luckily the work has already been done in `typescript` package and I just simply use it as a parser.

Still the parsing is probably quite heavier than others that I would **not recommend** Resource Script for realtime application. `tsc` is not fast, as [discussed by the Deno collaborators](https://github.com/denoland/deno/issues/5432). Resource Script would be a good fit for data that is quite "cold" that you want to put more emphasis to editing experience (especially if the programmers are the editor). It can then be pre-processed into more machine friendly data ahead of time. This also make it very difficult to write an importer code that generates Resource Script. (As opposed to various "to JSON" tools available everywhere.) Making Resource Script quite one-way. You should understand all these weaknesses before using it.

Also high dependency on `typescript` package/language to parse makes it unlikely that one can write a parser from scratch to use it in other environment that is not Node.JS. (I wish we have native Deno TypeScript lexer!)

## Features

### Simple key-values

```ts
const valueStorage = {
  string: 'Hello',
  num: 555,
  stringArray: ['Hello', 'World'],
  numArray: [123, 456, 789],
  isIt: true,
  flags: [true, true, false],
}
export default valueStorage
```

Key's name is on the left side using JavaScript object notation.

When storing simple values directly, the parser supports `string`, `number` and `boolean`, along with an array of entirely that type. Array of mixed type is not supported.

### Hierarchical keys

```ts
const hierarchicalExample = {
  home: {
    title: 'Home Page',
    description: 'This is the home',
  },
}
export default hierarchicalExample
```

String keys used to access the resource are hierarchical, similar to JSON. Unlike JSON, you don't need double quotes on the keys. Some other format like CSV may use `.` or `/` as a hierarchy to index into the data, but it is just an illusion as `a.x` and `a.y` are 2 different keys with no relationship.

XML-style resource file can also design a hierarchy, but personally I would love to author with TypeScript-like syntax more as the key does not need to be repeated for closing tag.

```xml
<Home>
  <Title>Home Page</Title>
  <Description>This is the home</Description>
</Home>
```

The parser also gives you all the parent's key leading to that key. If you want just an actual key of that node, then you can check just the final element.

- Join all parent keys into a single string to use with other systems that does not understand hierarchy. Reduce naming conflict when you only need to focus on getting the key unique among the siblings.
- Unlike JSON, TypeScript checker will warn you if you define duplicated keys among the siblings. It is essentially an object declaration and you can't have duplicated key.

### Comments as metadata

```ts
const commentExample = {
  /** This is shown on the status bar at top left corner. */
  name: 'My name is 5argon.',
}
export default commentExample
```

Add comments to any resource node by typing JSDoc style comment (`/** */`) above. (It won't work with just `//` becuase it won't "bound" to the code.) This make all resource node of Resource Script a tuple with an optional auxillary string storage by default.

It is increasingly important, for example when you are making resource for internationalization and needed to give context to the translators for each terms. The comment is a great feature prevalent in coding but not used much as a resource. (XML has comments, but often it does not count as an actual data. Not binding to the tag below, even.)

Some text editor can then show or hide comments, improving editing experience and you no longer fear of typing long comments.

### Tagged metadata with `@see`

```ts
let characterLimit: any
let manualLineBreak: any

const cjkProblem = {
  homePage: {
    /**
     * Page's title. Has space at most 2 lines, each line can contain 10 characters.
     * Likely 2 lines when viewed on mobile.
     * @see characterLimit 10
     * @see manualLineBreak
     */
    title: 'Extremely overly long title of the website. Welcome home!',
  },
}
export default cjkProblem
```

Consider this real situation : I wanted to model a localization terms but they need more data than the key and string value, and even more than a comment explaining where that term will be used.

Line breaking is a huge problem for [CJK languages](https://en.wikipedia.org/wiki/CJK_characters) because they don't have spaces to help breaking. Every character is breakable, but breaking at the wrong spot would cause it to be unreadable or even cause misunderstanding because each individual kanji means differently thing without the next character.

Solutions like [Budou](https://github.com/google/budou) attempts to combat this the most gracefully but also painstakingly by marking every possible location that it is allowed to break, then wrap `<span>` to prevent it break in the middle of character sequences we wanted to tie together. Ideally, all CJK text would need to be marked like this to be truly ubiquitous, usable on any UI elements, and any responsive arrangement. Imagine English being CJK, and "Submit" is in a button that was once a single line. When viewed on mobile the button gets too narrow and try to expands vertically. Now the text on the button reads "Sub (next line) mit". English doesn't break where there are no spaces, but in other languages this could happen for real.

Simpler solution also exists, by specifying character limit per line where that term would be used, the translator can manually insert a line break if the translation goes over the limit. This make the text less flexible, but make the translated string easier for the translator. (Imagine telling the translator "please put a `|` pipe character everywhere the sentence could be broken safely so I could turn them into `<span>` wrap!") This is good for non-responsive design, for example in novel game where the text box is always a specific width and characters are fixed size. (Other than when the character is shouting and the text gets bigger.. we may need to tell the translator that as well.)

How about explaining to the translator that a particular text is using markdown? (e.g. adding \*\* to make it bold) Rather than typing it down in the comment to explain, you likely want to just tag them.

Enough talk, but it seems we need much more metadata per object. You don't want to add it as a field to bloat the object either, you want to just "attach" them, they maybe just as important as the data but should not in the same "dimension". Therefore you can use the JSDoc comment space.

But these metadata would be nice if they are not counted as a `string` bundled with the comment. For this purpose, the parser will exclude `@see` JSDoc tags from the comment and provide them separately. I call this Tagged Metadata.

- `@see` tags cannot be in the same line as string comment. The line has to start with `@see`.
- Each `@see` must be followed by one of these formats :
  - `@see label` : The parser returns the label as string. Label must not contain any space.
  - `@see label value` : The parser return the label as string like above, but also value in a separated field. If value contains any space bar or not parsable to base-10 `number`, all are bundled as `string`. If parsable to base-10, it is returned as a `number` to you.
- You can add the next `@see` on the same line. e.g. `@see label1 100 @see label2 hello world @see label3` would give you back 3 sets of tagged metadata.
- The reason it has to be `@see` even though it doesn't make much sense in meaning, is because VSCode recently supports following the identifier on the right of `@see`, and also allows renaming, etc. This let you "define" the category of metadata to use everywhere systematically. An example above shows defining an identifier for usage with `let label: any`. But it also works for imported identifier from other modules which you may want to use in multiple Resource Scripts.

See different forms the Tagged Metadata could be in the [test fixture file](./test/fixture/tagged-metadata.rs.ts).

### Resource hierarchy spanning multiple files with imports

```ts
import infoModule from './infoModule.rs'

const main = {
  name: '5argon',
  age: 30,
  info: infoModule,
}
export default main
```

```ts
const infoModule = {
  birthplace: 'Udonthani',
  favColor: 'Lime Green',
}
export default infoModule
```

Each file is a TypeScript module with a single `default` export. You can continue the hierarchy in an another Resource Script file. The parsed result will count as if the extended object tree has continued parents. This make the resource file scalable, where in some other solutions each file is on its own.

Imports can be used by typing the "identifier" on the right side of the key. Remember that when identifier is used inside Named Tuple args, they are treated as a regular string. The only place that imports can be used is directly on the right side of the key.

- Since imports are real TypeScript tokens, you can also use "Go To Definition" in your editor to quickly jump to the target file and back. Giving you more incentive to split files because in other solutions you may not want to navigate on the browser too much.
- Similarly you can come back by using "Find All References". When there is only 1 reference which is usually the case, you can also do "Go To Definition" to jump back by most modern editors.
- Though not so useful, you can use imports in different place and the result will be as if they are different leaves. Hierarchical keys took care of any key duplication problems when you do this.
- Note that the import ends in `.rs` but the actual file is named `.rs.ts`.

WARNING : Please avoid import cycle, it **will** cause infinite loop. (PR welcome!)

### Named outermost object

```ts
/** Contains names */
const names = {
  me: '5argon',
  myMom: 'Not gonna tell you',
}
export default names
```

Alluding to JSON starting with `{ }` always, Resource Script also always start with "declaration" but is named. The parser can get both the name and comment metadata attached to this declaration as the first item in the AST.

This make it possible to use it as a "file name" metadata that is built into the data. You can load a bunch of Resource Script without caring about file names, because they are embeded inside.

### String symbol

```ts
enum Mood {
  Neutral,
  Happy,
  Sad,
}

const moodEachDay = {
  monday: Mood.Neutral,
  tuesday: [Mood.Neutral, Mood.Sad, Mood.Sad],
}
export default moodEachDay
```

All earlier features are just using JavaScript language as a medium. From here on we will also utilize TypeScript.

TypeScript `enum` can be used as an instanced string symbol. The `enum`'s type name does not matter and serve just to aid you in auto completion, and maybe later, mass rename them. You will get just the latter part in the parser. (`Neutral`, `Happy`, `Sad`)

It does not matter if you give concrete value to each enum as the parser only use the lexer. (Does not actually understand "symbols" and can jump to the source, it acts just like human reading the code linearly.) Some future work may allow replacing with concrete string value so you can use restricted name that is not possible as an identifier in TypeScript.

### Typed templating with arrow functions

```ts
const greetings = {
  greet: (name: string) => `Hello, my name is ${name}`,
  yourMother: (name: string, age: number) =>
    `My mom is named ${name} and she is ${age} years old.`,
}
export default greetings
```

Instead of using surrounders like other solutions (e.g. `My name is {name}`), Resource Script uses an arrow function and JavaScript template literal dollar sign syntax instead. Why would we want to do this now that we have to type `name` 2 times, dollar sign adds noise, and also need to type the arrow?

Advantages inherited from JavaScript :

- Syntax is highlighted, though in other templating solutions editor likely has good enough extension to highlight things in the surrounders. Note that if you use template placeholder in JSON on your own, it will not get highlighted as JSON only knows "string" and editor highlights all that as strings. So this is a JSON with template highlighting of sorts.
- Easier to see the list of parameters because they are collected on the left side of the arrow. It is impossible to mistype template literal on the right side either since it is defined as an argument token on the arrow function. So the "must type 2 times" is mostly mitigated by auto completion. In long sentence, it is quite useful to see what makes the string dynamic at a glance. (You can also still read it directly, though $ sign I agree is a bit distracting.)
- Using the template variable multiple times (though it is rare) will has syntax checking that they are all indeed the same "instance".

Adventages inherited from TypeScript :

- Each template variable is typed. Many solution encounter difficulty where a "switch case" must be provided for the parser to decide on what to do. (e.g. pluralization needs to know that the entered value is a "string of number".) Resource Script parser can get type information bound to each template variable by the colon `:` syntax as a string. Then it depends how you want to use them.
- Note that the type is not real, you are simply returned a string of that type. Think of it as annotating an another arbitrary string besides the argument, which those strings happened to read "string", "number", "boolean" and so on. Type reference token is also supported (e.g. `Date`). You can define `type` and use that type so you get the string of that type's name in the parser.
- When you use the parameters that is type annotated with named tuples (described in the next section), the types are actually useful as an error checking.

### Named tuples

Resource Script can define a named, typed tuples. We borrow function syntax from TypeScript.

```ts
enum Temp {
  Hot,
  Cold,
}
function pair(color: string, temperature: Temp, degree: number) {}

const days = {
  monday: pair('yellow', Temp.Hot, 38),
  tuesday: pair('pink', Temp.Cold, 19),
  wednesday: pair('green', Temp.Hot, 40),
}
export default days
```

Here we essentially hack TypeScript a bit by declaring a **useless function** just so we can use it.

The parser will be able to get `"pair"` along with each element, which supports the same data type as in other places.

Note that the parameter names on the useless function (`color`, `temperature`, `degree`) are not accessible by the parser, but helps you put in the right thing into each slot of the tuple. If you comment JSDoc the useless function nicely, editor will be nicer to you when you type it.

It is also possible to put a tuple inside the template string. It can model something like [ICU transforms](https://unicode-org.github.io/icu/userguide/transforms/general/) in a more organized manner and get better syntax highlighting.

```ts
function plural(num: number, singular: string, plural: string) {}

const pluralizers = {
  fish: (n: number) => `I see ${plural(n, 'fish', 'fishes')}}.`,
  chip: (n: number) => `I see ${plural(n, 'chip', 'chips')}}.`,
}
export default pluralizers
```

The same that `num`, `singular`, and `plural` is inaccessible to the parser, `number`, `string`, and `string` here are also inaccessible. But TypeScript now help you put in the right stuff inside the right slot of the tuple. Combined with type annotated in the arrow function (`n: number`), this can vastly improve editing experience because the type are more real and useful.

When you use arrow function parameters ("identifier") in the tuple (like `n` in the example) it will be counted as `string` of that name as opposed to an import (explained in the next section). Remember that this is not an actual arrow function of TypeScript, we just borrowed the syntax. The function does not actually "work".

### Great editing experience

- You can get syntax highlighting from code editor to help authoring it. Number and strings are colored differently. You can see placeholder variable in the template literal clearly.
- You get error checking by your code editor.
- Possible to use toolings like `prettier` or `eslint` to easily format the resource content.

## Parsing into an Abstract Syntax Tree (AST)

Resource file would not be of any use without a parser. The parser is essentially just using `typescript` [Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API). You can either use a path to file or a string of content of that file.

```ts
/**
 * Throw if the file is not found or malformed.
 */
export function parseFile(files: string): Ast

/**
 * Ignores any import statement.
 */
export function parseString(s: string): Ast
```

When traversing the returned `Ast` object in TypeScript, provided type guards will be useful. (This is similar pattern to the TypeScript's Compiler API.)

I didn't write any documentation on the shape of the returned object yet but it should be fairly straightforward to learn from the [`interface.ts` file](./src/interface.ts). Type guards can also be learned from [`type-guards.ts` file](./src/type-guards.ts). Also of course the [test file](./test/parse.test.ts) will show a usage from package consumer's perspective.

## Converting a Resource Script to JSON

With the parser to AST maybe the first thing you want to write on is to convert it to a highly ubiquitous JSON. I have bundled a bonus script to do just that. [Details here](./documentation/to-json.md).

## Related Projects

Resource Script was created originally to author [Format.JS](https://formatjs.io/) localization terms more easily. Required Format.JS code that is required but verbose and difficult to maintain are generated from Resource Script instead. Resource Script can model [ICU Message syntax](https://unicode-org.github.io/icu/userguide/format_parse/messages/) in a way that not everything are baked into strings. See [`resource-script-formatjs`](https://github.com/5argon/resource-script-formatjs).
