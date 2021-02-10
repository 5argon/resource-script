# TypedStringResource

First you should survey roughly how these packages works, because it highlights i18n problems in production.

-   [Format.JS / react-intl](https://formatjs.io/)
-   [i18next / react-i18next](https://react.i18next.com/)
-   [LinguiJS](https://lingui.js.org/)
-   [rosetta](https://github.com/lukeed/rosetta)

Common themes :

-   Programmer can do something better than hard-coding the string.
-   Those things could be generated into a (default language) resource file. Maybe by tools that parse AST (Abstract Syntax Key) and try to get the call site of each terms. (All of the examples except `rosetta` do this in different styles.)
-   Resource files can be uploaded to online translation service with nice UI and authentication, to get help from remote translators, etc.
-   You get the same kind of resource files back times the languages you want to support. The code that replaces string hard-coding can select the right resource file to use.

I prefer Format.JS since I would like to use ICU syntax.

## Usability problems of Format.JS

### The declaration takes a lot of code space

I agree with making the terms as "contextual" as possible. But all the [ways described](https://formatjs.io/docs/getting-started/message-declaration) are quite obtrusive to read when you want to focus on the UI code. (Both the imperative way and using React component way.)

Though, I understand the need for all the parameters needed to make everything works from extraction to runtime rendering.

### The keys are not hierarchical

The documentation advise against explicitly providing a string key and let it generate a hash because string key could cause collision.

However many of my use case wanted to have hierarchical key separated by `.` or `/`. It is both useful for the programmer and also the UI that allows collaborated translation. Tools can be written to display hierarchical keys in a tree so it is easier to navigate for the translators.

Also defining `home.title` and `home.description` does not make it actually hierarchical, they are 2 different strings. Renaming the middle of hierarchy is also difficult.

You also are committed to the name once you start using the hierarchy. But usually the name in the middle of hierarchy is tied to business logic, and requirement can change. It would feel quite bad if you define many terms under `about.` hierarchy then suddenly the about page moved to be under any other page, left the keys "stale".

## An ideal call site of the terms

At the call site I would like to be able to use something like these in place of any `string` I want. They are all compact one liners instead of the ways described in Format.JS documentation. There is also no `intl` in sight.

```jsx
<div>{textResource.home.title} - {textResource.home.description}</div>
<div>{textResource.home.daysLeft(5)}</div>
<div>{textResource.home.yourNameIs("5argon")}</div>
```

This should be fully type checked by the power of TypeScript. You can't input `string` into `daysLeft`. You can't input `number` into `yourNameIs`. You cannot forget sending arguments into the terms that need them. I would like to utilize the power of TypeScript as much as possible.

`textResource` should be a representation of `intl` object, housing the right current language. Therefore it need to be a `class` instance that contains an actual `intl` object inside. In the case of React, this `textResource` may comes from React context which re-renders whenever the language is changed.

Then inside would be a proper declaration of what Format.JS required. Basically, they are all accessor mapped 1-to-1 to an actual call that needed to be there in the middle of code. This is an example of `class` design that would give the desired developer experience :

```ts
export default class TextResource {
	private intl: IntlShape
	get home() {
		return {
			/** Title text */
			title: this.intl.formatMessage({
				id: 'home.title',
				description: 'Title text',
				defaultMessage: 'Title',
			}),

			/** Description text */
			description: this.intl.formatMessage({
				id: 'home.description',
				description: 'Description text',
				defaultMessage: 'Description',
			}),

			/** Days left until release date */
			daysLeft: (days: number) =>
				this.intl.formatMessage(
					{
						id: 'home.daysLeft',
						description: 'Days left until release date',
						defaultMessage: 'Days Left : {days}',
					},
					{ days: days },
				),

			/** Visitor name */
			yourNameIs: (name: string) =>
				this.intl.formatMessage(
					{
						id: 'home.yourNameIs',
						description: 'Visitor name',
						defaultMessage: 'Your Name Is : {name}',
					},
					{ name: name },
				),
		}
	}
}
```

As you can see, the call site is nice and type checked now, but we moved the ugliness into this accessor instead. Making this file is equally time consuming.

-   Each entry is extremely verbose. You can barely see 2 terms next to each other since they are so far apart. You lose an ability to perform a quick overview over the terms in similar area, something that would be great now that we have a hierarchy.
-   The hierarchy is still an illusion, you need to provide `id` that repeats the hierarchy you just made. (e.g. `home.` being repeated for all terms here.)
-   You can still mistype the `{days}` ICU placeholder string.
-   The parameter part is an `any`. You can also mistype the object key here.

## Solution

That class declaration is inevitable for Format.JS to work, but for human programmer looking at the code, this can describe that class equally :

```ts
export const textResource = {
	home: {
		/** Title text */
		title: 'Title',
		/*+ Description text */
		description: 'Description',
		/** Days left until release date */
		daysLeft: (days: number) => `Days Left : ${days}`,
		/** Visitor name */
		yourNameIs: (name: string) => `Your Name Is : ${name}`,
	},
}
```

This is not just a template, it happened to be a valid TypeScript code as well.

-   You gained syntax highlighting. This is quite useful in strings that has a placeholder because the variable got colored differently.
-   You can auto format with tools like `prettier` or `eslint`. Note that `eslint` can turn `+` string concatenation into templated string like above.
-   With real variable used in the string, it is not possible to make a mistake.
-   When strings are close to each other in the same file like this, it is possible to review overall strings without even going into your UI code where you used the string. I think this is even better than having the string near the UI code.

Making this an ideal way of authoring terms to use in the code.

This package aims to use this rather readable TypeScript string resource format to **codegen** that Format.JS accessor class one to one. You can then use the generated class file to assemble the full API as you like.
