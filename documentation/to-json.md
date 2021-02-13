# Converting a Resource Script to JSON

Though not the original goal, I have exported a bonus method that can convert Resource Script AST into JSON string for fun : `astToJSON`.

Also I added a bonus Node.JS package script called `resource-script to-json` that can be used on the `.rs.ts` file (multiple ok) to produce `.json` file in the same place.

Not everything in Resource Script make sense in JSON, but the hierarchical aspect is still pretty much perfectly mappable. You may use it to try authoring a "TypeScript powered JSON" before converting to the real one for a change...

```
yarn resource-script to-json ./my-rs-file.rs.ts
yarn resource-script to-json ./my-rs-file.rs.ts ./my-rs-file-2.rs.ts
yarn resource-script to-json -c object ./my-rs-file.rs.ts
yarn resource-script to-json -c deep ./my-rs-file.rs.ts
yarn resource-script to-json -c forced-deep ./my-rs-file.rs.ts
```

For example if performed on this Resource Script files :

```ts
import linked from './fixture-sub'

enum En {
  En1,
  En2,
}
function LitFunc(arg: string, en: En, count: number) {}

/** comment 0 */
const outer = {
  /** comment 1.1 */
  level11: {
    /** comment 2.1 */
    level21: linked,
    /** comment 2.2 */
    level22: 'level22-string',
    /** comment 2.3 */
    level23: (firstArg: number) => `${firstArg} span string 1`,
    /** comment 2.4 */
    level24: (firstArg: string, secondArg: string) =>
      `${firstArg} span string 1 ${secondArg} span string 2`,
    /** comment 2.5 */
    level25: (firstArg: string, secondArg: string) =>
      `span string 1 ${LitFunc(firstArg, En.En1, 10)} span string 2 ${LitFunc(
        secondArg,
        En.En2,
        20,
      )}`,
  },
  /** comment 1.2 */
  level12: 'level12-string',
  /** comment 1.3 */
  level13: 5555,
  /** comment 1.4 */
  level14: ['string1', 'string2', 'string3'],
  /** comment 1.5 */
  level15: [111, 222, 333],
  /** comment 1.6 */
  level16: true,
  /** comment 1.7 */
  level17: [true, false, true],
  /** comment 1.8 */
  level18: LitFunc('string1', En.En1, 555),
  /** comment 1.9 */
  level19: En.En1,
  /** comment 1.10 */
  level110: [En.En1, En.En2],
}

export default outer
```

Which has an import from this file :

```ts
/** comment linked 0 AS A LINKED MODULE THIS WILL NOT MATTER */
const linked = {
  /** comment linked 1.1 */
  levelLinked11: {
    /** comment linked 2.1 */
    levelLinked21: 'level-linked-21-string',
    /** comment linked 2.2 */
    levelLinked22: 'level-linked-22-string',
  },
  /** comment linked 1.2 */
  levelLinked12: 'level-linked-12-string',
}
export default linked
```

It converts to :

```json
{
  "level11": {
    "level21": {
      "levelLinked11": {
        "levelLinked21": "level-linked-21-string",
        "levelLinked22": "level-linked-22-string",
        "comment": "comment linked 1.1"
      },
      "levelLinked12": "level-linked-12-string",
      "comment": "comment 2.1"
    },
    "level22": "level22-string",
    "level23": "{firstArg} span string 1",
    "level24": "{firstArg} span string 1 {secondArg} span string 2",
    "level25": "span string 1 {LitFunc(firstArg, En1, 10)} span string 2 {LitFunc(secondArg, En2, 20)}",
    "comment": "comment 1.1"
  },
  "level12": "level12-string",
  "level13": 5555,
  "level14": ["string1", "string2", "string3"],
  "level15": [111, 222, 333],
  "level16": true,
  "level17": [true, false, true],
  "level18": "LitFunc(string1, En1, 555)",
  "level19": "En1",
  "level110": ["En1", "En2"]
}
```

- Outermost object (`const outer = {`) is ignored.
- There are 3 modes to convert comments (via `-c` option) available in `astToJSON`, or you can ignore all comments by providing `undefined`. The result above is using `'object'` mode, note that only some comments are transferred. (The one on the object, so we have a nice place to store it.)
  - `'object'` : Only transfer comments over the object to `"comment"` JSON key.
  - `'deep'` : Also make comment on any non-object keys to turns the value to be `{ comment: ___, value: ___ }` instead to make room for storing the comment. This change the shape of data significantly for fields that has comment.
  - `'forced-deep'` : Same as `'deep'` but even fields without comments are forced to have `{ comment: "", value: ___}`. (Empty string comment.)
- All the `${}` inside templated strings are converted into a simple `{}` without the dollar sign, should you want to author templated JSON in TypeScript fashion where you can get some syntax highlighting help. (TODO: Make the surrounders configurable e.g. double curly brackets. PR welcome!)
- Named tuples output almost as-is and doesn't make much sense.
