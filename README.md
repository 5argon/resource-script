(Note : this is WIP)

# speedloc

Tools to maintain code-based, localized string resource in TypeScript language. Making string resources programmer-first.

## What is a "code-based string resource"

In TypeScript of course you can just type a string where you want it to be used. But it would be a pain to find and edit them later since strings are mixed up with business logic.

Then you might create `strings.ts` and store all the variables there that the UI code picks up and use. This is a "code-based string resource". The file is `.ts` that gets compiled and not a pure resource file like JSON. It is connected to the code and TypeScript could make sense of them. This might sounds dumb but that's all it is. A TypeScript module consist of mostly `string` exports or function that produces `string`.

You might have used the de-facto string resource approach of using a text database file then your code access terms from the database with a string key. Personally I have always want those strings to be more tightly integrated to my code. At the same time the code-based way will have several weaknesses, which I would like to address with this package.

You can use find references on any of the terms and see all usages. Inversely you can go to definition while programming to arrive at the string and make some edits. Refactoring variable names is possible. Making the code red on purpose by removing some terms is also possible, so you are guided by the code editor where to fix them. In resource-file based solution, when it grows no one would be brave enough to remove or rearrange any of the terms because the fear of silently breaking something deep in the app.

### Dynamic string advantages

When you want a dynamic string like pluralization, you can whip up a `(args)=>string` function instead of just a `string` and **program** it exactly that you want. For example :

```ts
const errorDialogHeader : (numErrors: number) => string = 
  (numErrors) => {
    `There are ${numErrors} ${numErrors === 1 ? "error": "errors"}, please review ${numErrors === 1 ? "it": "them"}.`
  }
```

With "just a function", you can handle intricacies of each languages as you like given common parameters. Speedloc will provide some helper functions to help you. For example, `pl(num, singleString, multipleString)` for plural switch like above.

In helper library like [`i18next`](https://www.i18next.com/translation-function/plurals) which is based on string key, dynamic features are built on the key and inside the string. For example by adding `_plural` to the key, or having `{{placeholder}}` baked in the string so the package can replace it using object key named the same. I feels icky that there has to be some "non-codified" things lurking in the project and `tsc` can't get its hand on and work for me. With code-based resource file, all the `{{placeholder}}` could instead become a "real" `${placeholder}` that is maintainable and not error prone.

### String organization advantages

Many pure resource file based solution offers hierarchy by using `.` on the string key. So you can have `mainPage.header`, `mainPage.description`, etc. This fixed naming conflict problem as one person does not need to know about all the keys in the app to use a common name like `ok`. (e.g. different `ok` text for differrent dialog boxes.) Or you can have multiple resource files as one higher level of hierarchy.

However those hierarchy are just an illusion. `mainPage.header` and `mainPage.description` are 2 different strings and that is all. It could only help visually to the programmer that try to type in the string key that it has the same prefix.

With TypeScript, we could make a real hierarchy of strings and programmers access them the same way : 

```ts
const mainPage = {
  name : "Main Page",
  tabs : {
    home : "Home",
    about : "About",
  },
  footer : {
    companyName : "Exceed7 Experiments",
  },
}
```

We have used the JS object to our advantage that sometimes inside an object is a string, or sometimes it could be an another object. Not to mention if we refactor the `tabs` ("middle" of the key) then it actually refactors everything under that hierarchy. In string key approach, hierarchy may prevent name conflict but naming the hierarchy is a big commitment because it is difficult to change later. And often, this hierarchy name is tied to business logic. We might have `highScore` page now but if it were removed or moved to be under any other page, now your string resource is not consistent since the hierarhy looks outdated.

### Round trip advantages

Supposed that an online, scalable localization solution that you can go define a new term has an export option that does not stop at generating `.json` file, but also TypeScript accessor for all terms.

But still having to go to the website just to define a string and wait for codegen to finally use it in the code takes too long and break programming flow. This round trip adds fatigue when you are designing UI as you encounter new terms to be used. It is very hard to imagine all the terms needed ahead of time because they might be needed to be splitted to different UI pieces.

I would like to propose a solution that is very fast to define a term and have it accessible from code by programmer ("programmer-centric"). To have non-programmer translator access them, we transform from the code to resource file instead of the other way around.

## Problems

Now that code-based resource has many advantages, it creates some problems as well.

### Size and lazy loading

Codes are compiled, and it could make the app big if you are not going to use some area of the text yet.

Speedloc intends to solve this by having different "dev mode" where code could follow to the core of any strings, but when going to "deploy mode", all the strings are generated into several classic text resource files. The accessor that you used in the code is then changed to lazy load them as needed.

### Localization

One main advantage of using a resource file that is not a code, is that if you want to switch languages, the helper package can just switch the file to a different set with equal amount of keys.

If we code all the strings, it would be a pain if we have to do this for all strings : 

```ts
const mainPage = (lang:string) => {
  switch(lang) {
    case "en" : return "Main Page"
    case "th" : return "หน้าแรก"
  }
}
```

Same goes for the terms that we made into functions. The problem is that we don't want the language switch at the term level. We want to select language first then see all the terms in just that langauage side by side. Code is linear and not a matrix like spreadsheet, we don't have 1 more dimension to use as the languages.

So instead, you need to select the right resource object with code-based string resource.

```ts
const engString : string = resource("en").mainPage
const thaiString : string = resource("th").mainPage
```

Some observations from this : 

- We can leverage `interface` of TypeScript to keep the resource type the same for all languages. Perhaps `resource(lang)` should return `TextResource` that you defined on your own. Containing your app-specific tree of objects that leads to either `string` or a function returning `string`.
- We can omit the language string and make `resource()` returns the "current" language instead. For web app project, it could be from the URL we are visiting. (e.g. `mysite.com/th/home`) In React, we could use `useTextResource()` that will give the right resource for the language we are currently on. But this is not a focus of this package.

The first point is important. So we should not directly have a delclaration of object with the result like this directly :

```ts
const mainPage = {
  name : "Main Page",
  tabs : {
    home : "Home",
    about : "About",
  },
  footer : {
    companyName : "Exceed7 Experiments",
  },
}
```

But instead, we want to define :

```ts
interface MainPageTerms {
  name : string
  tabs : {
    home : string
    about : string
  },
  footer : {
    companyName : string
  },
}
```

So the data could be enforced for all languages.

This creates more frictions however. As soon as you add more terms to the `interface`, you are asked to fill in that term's value in **all** languages which is not in this same file. You lose an ability to quickly add new terms and type the string on the right side of colon when you start using `interface`.

You may want to work quick and add just the English one but it is not possible to skip other languages before the code could be compiled.

Speedloc intends to have a code generator script that let you just fill in the `interface` part. (Be it `string` or function) Then generates placeholder declaration for all languages. You can then use find all references feature of your code editor to go to each language.

### Scalable localization

The resource files are easy to be uploaded to online service where there is an auth that opens faraway localization staff to collaborate and fill in the strings. After, they will be exported back to the app as a new resource file that is filled.

Speedloc will has an exporter that generates the resource file and importer that imports **all the way** to code generation of each terms.

## How to use

Speedloc gives you an executable commands that will process the files in your project.

## Motivations

The de-facto localization solution today is to :

1. Not hard-code any string into your code base.
2. Strings are inside a resource file instead. These resource files allows lazy loading, and more importantly hot-swapping to change language of the app. Each string is tied to a **key**. Keys can be in hierarchy e.g. using dot notation.
3. The resource files should be generated from **online** localization management platform (e.g. [Crowdin](https://crowdin.com/)). The reason for online is so you can hire remote translator to fill in missing strings, discuss with them, send screenshots to them where would this string shows, without giving them access to your app. The platform has authentication system so you can generate an ID for each translator, and ID for your internal personnel.
4. The resource file is then accessed by hardcoding string key that represent the terms anyway. Library like `i18next` can help with this, but still hardcoding string key will be required.
5. To use more advanced feature like pluralization you may have to post-process the output from your online platform to be compatible. e.g. `i18next` wants the term's key to end with `_plural` so it could automatically choose the right word.

There are things I don't like about this approach :

- Massive round-trip time if you are UI developer making a new page, and wanted to add new strings **along the way** that is not hard-coded. You have to go to online platform to add new terms, generate it to local resource file, finally use the string key to access. When this occurs often it easily breaks programming flow. Programmer should be able to add a new term as fast as hard coding it, but at the same time fully functional with multiple languages **later**.
- Online management platform has expensive monthly cost. If you are just making your personal website you may only need to "manage" your strings once and all alone. You just want a nicer UI than using a spreadsheet to edit your resource. Offline and free solution like [Traduora](https://github.com/traduora/traduora) exists, but still it is not programmer-centric enough.
- Ideally I would like no magic strings inlined throughout the app. String keys are needed to access the term, but if you use it multiple times then editor can no longer help you update all "instances" of them. An ideal way is to use language feature, has an actual variable accessor for **all** string keys. If you use online platform-centric approach, you will need a post processing step to codegen the accessor for all keys into TypeScript.

I expand the last idea inversely by having you **start from TypeScript** instead. If you need a new term, it should be easy to just declare to the right part of interface. If you need online collaboration later, the TypeScript files should be instead imported to the online platform. Thus making it more programmer-centric.

## Harnessing the code editor

Online translation management platform has many functions that is friendly to translators who may not be proficient with computers. But if you are a programmer then the code editor maybe much more powerful to get the job done.

I would like to :

- Be able to use Go To Definition on any terms to arrive at the source, then make a quick edit all by code editor. In conventional way, even if each term has an accessor, you would not arrive at the text of that term because they are in the resource file. It is not accessible from code. Instead you will arrive at only the key of that term.
- Inversely, be able to browse all terms of multiple levels roughly with simply scrolling down (maybe I want to review what is missing without playing the app) and then find the files that had already used any terms. This should work throughout the monorepository.
- Have the code editor indentation helps create a visually pleasing tree structure. Prettier and ESLint should be able to format it nicely. This will beat many front-end UI that requires quite a lot of clicking to navigate trees.
- Able to add new terms quickly and only provide English translation at first. All other languages should receive the same string as English by default.
- Instead of using template strings or special rule for interpolation and plurals, programmer should be able to just write a lambda function that performs exactly what they need. e.g. if you need interpolation, the term itself is a TypeScript function `(count: number) => string`. You can then have a very nice editor guidance with named parameter when you use it. If you use backtick literal interpolation and `${}`, editor can color it very nicely compared to having specific placeholder string from the online platform.
- With hierarchical keys, the accessor object should be able to auto complete possible choice on each `.` typed. To put it simply the object should be a big, nested `interface`. This let you name the key as descriptive as you want without fearing that it would be too long since auto complete will help you.
- Use Vim mode to navigate.
- Able to use `tsc -b` watch mode to instantly reflect the string changes into the app. Online solution also provides API for you to eventually make something like this, but it would not be as instant and seamless.
- Rename a term easily on any level and have it reflects throughout the app. It is often the case that requirements changes, and while the string can be updated, the term get stale because you don't want to change it out of fear of breaking an entire app randomly. e.g. the term was originally `importPage.importingFromSpreadsheet` then later it can import from more things, you want to change it to `importPage.importing`. You can easily use VSCode rename with help of TypeScript. You can also rename the name in the middle of hierarchy because we have a real hierarchy. (With online solution, the term `a.b.one` and `a.b.two` usually aren't actually nested.)
- A way to reorder a term. I want to also move the term to a different nesting. Note that this is difficult even in regular TypeScript.

## Spreadsheet cons 

With spreadsheets, columns may be different languagees, rows maybe each term, etc.

- Spreadsheets are not good when one term contains longer text. If you make the column bigger, it affects all other short terms to be bigger and there are a lot of wasted whitespaces on the page just because one term takes a lot of space. If you make it auto-break into new line at the table's border, then it does not look good vertically. Also a lot of spreadsheets doesn't have word wrapping if you don't add a real new line character. Also you don't want this new line character to be used in the real app.
- Hierarchical keys could not be represented nicely because rows are flat.
- You want to work on language pairs, you don't want to be distracted by all other languages.

## How it works

You define a big tree of interface `TextResource` with any nesting you like. It should leads into finally getting `string` or `() => string`.

The you declare a variable of type `TextResource`. TypeScript should error if you are missing any terms. It maybe daunting to fill in all the fields, so there is a tool to code gen a file that declares all the terms as an empty string for you to get started. This is your main language.

All other languages are done in the same way, by delclaring a variable. Except this time the type is `Partial<TextResource>`. This allows you to add a new term and have TypeScript warns you on only the main language one. There is an another tool to "conform" other languages to has updated declarations, with resulting string the same as main language.