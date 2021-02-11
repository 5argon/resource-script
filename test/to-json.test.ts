import { Ast, parseFile, astToJSON } from '../src'

function parseAst(): Ast {
	const p = parseFile('./test/fixture/fixture.ts')
	return p
}

const ans1 = `{
  "level11": {
    "level21": {
      "levelLinked11": {
        "levelLinked21": "level-linked-21-string",
        "levelLinked22": "level-linked-22-string"
      },
      "levelLinked12": "level-linked-12-string"
    },
    "level22": "level22-string",
    "level23": "{firstArg} span string 1",
    "level24": "{firstArg} span string 1 {secondArg} span string 2",
    "level25": "span string 1 {LitFunc(firstArg, En1, 10)} span string 2 {LitFunc(secondArg, En2, 20)}"
  },
  "level12": "level12-string",
  "level13": 5555,
  "level14": [
    "string1",
    "string2",
    "string3"
  ],
  "level15": [
    111,
    222,
    333
  ],
  "level16": true,
  "level17": [
    true,
    false,
    true
  ],
  "level18": "LitFunc(string1, En1, 555)",
  "level19": "En1",
  "level110": [
    "En1",
    "En2"
  ]
}`

const ans2 = `{
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
  "level14": [
    "string1",
    "string2",
    "string3"
  ],
  "level15": [
    111,
    222,
    333
  ],
  "level16": true,
  "level17": [
    true,
    false,
    true
  ],
  "level18": "LitFunc(string1, En1, 555)",
  "level19": "En1",
  "level110": [
    "En1",
    "En2"
  ]
}`

const ans3 = `{
  "level11": {
    "level21": {
      "levelLinked11": {
        "levelLinked21": {
          "value": "level-linked-21-string",
          "comment": "comment linked 2.1"
        },
        "levelLinked22": {
          "value": "level-linked-22-string",
          "comment": "comment linked 2.2"
        },
        "comment": "comment linked 1.1"
      },
      "levelLinked12": {
        "value": "level-linked-12-string",
        "comment": "comment linked 1.2"
      },
      "comment": "comment 2.1"
    },
    "level22": {
      "value": "level22-string",
      "comment": "comment 2.2"
    },
    "level23": {
      "value": "{firstArg} span string 1",
      "comment": "comment 2.3"
    },
    "level24": {
      "value": "{firstArg} span string 1 {secondArg} span string 2",
      "comment": "comment 2.4"
    },
    "level25": {
      "value": "span string 1 {LitFunc(firstArg, En1, 10)} span string 2 {LitFunc(secondArg, En2, 20)}",
      "comment": "comment 2.5"
    },
    "comment": "comment 1.1"
  },
  "level12": {
    "value": "level12-string",
    "comment": "comment 1.2"
  },
  "level13": {
    "value": 5555,
    "comment": "comment 1.3"
  },
  "level14": {
    "value": [
      "string1",
      "string2",
      "string3"
    ],
    "comment": "comment 1.4"
  },
  "level15": {
    "value": [
      111,
      222,
      333
    ],
    "comment": "comment 1.5"
  },
  "level16": {
    "value": true,
    "comment": "comment 1.6"
  },
  "level17": {
    "value": [
      true,
      false,
      true
    ],
    "comment": "comment 1.7"
  },
  "level18": {
    "value": "LitFunc(string1, En1, 555)",
    "comment": "comment 1.8"
  },
  "level19": {
    "value": "En1",
    "comment": "comment 1.9"
  },
  "level110": {
    "value": [
      "En1",
      "En2"
    ],
    "comment": "comment 1.10"
  }
}`

test('To JSON no comment', () => {
	const json = astToJSON(parseAst())
	expect(json).toBe(ans1)
})

test('To JSON with comment (object)', () => {
	const json = astToJSON(parseAst(), 'object')
	expect(json).toBe(ans2)
})

test('To JSON with comment (deep)', () => {
	const json = astToJSON(parseAst(), 'deep')
	expect(json).toBe(ans3)
})

test('To JSON with comment (forced-deep)', () => {
	const json = astToJSON(parseAst(), 'forced-deep')
	expect(json).toBe(ans3)
})
