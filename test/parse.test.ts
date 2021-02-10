import {
	Ast,
	nodeIsGroup,
	nodeIsNoParams,
	nodeIsWithParams,
	parse,
	tokenIsParamToken,
	tokenIsTextToken,
} from '../src'
function parseAst(): Ast {
	const p = parse('./test/fixture/fixture.ts')
	if (p === undefined) {
		fail('Parsing failed.')
	}
	return p
}

test('Outer', () => {
	const ast = parseAst()
	expect(ast.keys).toEqual(['outer'])
	expect(ast.comment).toBe('comment 0')
	expect(ast.nodes).toHaveLength(2)
})

test('First inner', () => {
	const ast = parseAst()
	expect(ast.nodes).toHaveLength(2)

	const n0 = ast.nodes[0]
	expect(n0.keys).toEqual(['outer', 'level11'])
	expect(n0.comment).toBe('comment 1.1')
	if (nodeIsGroup(n0)) {
		expect(n0.nodes).toHaveLength(5)
	} else {
		fail()
	}

	const n1 = ast.nodes[1]
	expect(n1.keys).toEqual(['outer', 'level12'])
	expect(n1.comment).toBe('comment 1.2')
	if (nodeIsNoParams(n1)) {
		expect(n1.text).toBe('level12-string')
	} else {
		fail()
	}
})

test('Inner object - string', () => {
	const ast = parseAst()
	expect(ast.nodes).toHaveLength(2)

	const n0 = ast.nodes[0]
	if (nodeIsGroup(n0)) {
		expect(n0.nodes).toHaveLength(5)
		const i2 = n0.nodes[1]
		expect(i2.comment).toBe('comment 2.2')
		expect(i2.keys).toEqual(['outer', 'level11', 'level22'])
		if (nodeIsNoParams(i2)) {
			expect(i2.text).toBe('level22-string')
		} else {
			fail()
		}
	} else {
		fail()
	}
})

test('Inner object - arrow function 1 arg', () => {
	const ast = parseAst()
	expect(ast.nodes).toHaveLength(2)

	const n0 = ast.nodes[0]
	expect(nodeIsGroup(n0)).toBe(true)
	if (nodeIsGroup(n0)) {
		expect(n0.nodes).toHaveLength(5)
		const i3 = n0.nodes[2]
		expect(i3.comment).toBe('comment 2.3')
		expect(i3.keys).toEqual(['outer', 'level11', 'level23'])
		if (nodeIsWithParams(i3)) {
			expect(i3.tokens).toHaveLength(2)
			if (tokenIsParamToken(i3.tokens[0])) {
				expect(i3.tokens[0].paramName).toBe('firstArg')
			} else {
				fail()
			}
			if (tokenIsTextToken(i3.tokens[1])) {
				expect(i3.tokens[1].text).toBe(' span string 1')
			} else {
				fail()
			}
		} else {
			fail()
		}
	} else {
		fail()
	}
})
