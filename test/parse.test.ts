import {
	Ast,
	nodeIsGroup,
	nodeIsNoParams,
	nodeIsWithParams,
	parse,
	tokenIsFunctionToken,
	tokenIsParamToken,
	tokenIsTextToken,
	FunctionTokenParamType,
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

test('Inner object - arrow function 2 args', () => {
	const ast = parseAst()
	expect(ast.nodes).toHaveLength(2)

	const n0 = ast.nodes[0]
	expect(nodeIsGroup(n0)).toBe(true)
	if (nodeIsGroup(n0)) {
		expect(n0.nodes).toHaveLength(5)
		const i4 = n0.nodes[3]
		expect(i4.comment).toBe('comment 2.4')
		expect(i4.keys).toEqual(['outer', 'level11', 'level24'])
		if (nodeIsWithParams(i4)) {
			expect(i4.tokens).toHaveLength(4)
			if (tokenIsParamToken(i4.tokens[0])) {
				expect(i4.tokens[0].paramName).toBe('firstArg')
			} else {
				fail()
			}
			if (tokenIsTextToken(i4.tokens[1])) {
				expect(i4.tokens[1].text).toBe(' span string 1 ')
			} else {
				fail()
			}
			if (tokenIsParamToken(i4.tokens[2])) {
				expect(i4.tokens[2].paramName).toBe('secondArg')
			} else {
				fail()
			}
			if (tokenIsTextToken(i4.tokens[3])) {
				expect(i4.tokens[3].text).toBe(' span string 2')
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

test('Inner object - arrow function with literal function', () => {
	const ast = parseAst()
	expect(ast.nodes).toHaveLength(2)

	const n0 = ast.nodes[0]
	expect(nodeIsGroup(n0)).toBe(true)
	if (nodeIsGroup(n0)) {
		expect(n0.nodes).toHaveLength(5)
		const i5 = n0.nodes[4]
		expect(i5.comment).toBe('comment 2.5')
		expect(i5.keys).toEqual(['outer', 'level11', 'level25'])
		if (nodeIsWithParams(i5)) {
			expect(i5.tokens).toHaveLength(4)
			if (tokenIsTextToken(i5.tokens[0])) {
				expect(i5.tokens[0].text).toBe('span string 1 ')
			} else {
				fail()
			}
			if (tokenIsFunctionToken(i5.tokens[1])) {
				expect(i5.tokens[1].functionName).toBe('LitFunc')
				expect(i5.tokens[1].params).toHaveLength(3)

				expect(i5.tokens[1].params[0].content).toBe('firstArg')
				expect(i5.tokens[1].params[0].type).toBe<FunctionTokenParamType>('string')

				expect(i5.tokens[1].params[1].content).toBe('En1')
				expect(i5.tokens[1].params[1].type).toBe<FunctionTokenParamType>('enum')

				expect(i5.tokens[1].params[2].content).toBe(10)
				expect(i5.tokens[1].params[2].type).toBe<FunctionTokenParamType>('number')
			} else {
				fail()
			}
			if (tokenIsTextToken(i5.tokens[2])) {
				expect(i5.tokens[2].text).toBe(' span string 2 ')
			} else {
				fail()
			}
			if (tokenIsFunctionToken(i5.tokens[3])) {
				expect(i5.tokens[3].functionName).toBe('LitFunc')
				expect(i5.tokens[3].params).toHaveLength(3)

				expect(i5.tokens[3].params[0].content).toBe('secondArg')
				expect(i5.tokens[3].params[0].type).toBe<FunctionTokenParamType>('string')

				expect(i5.tokens[3].params[1].content).toBe('En2')
				expect(i5.tokens[3].params[1].type).toBe<FunctionTokenParamType>('enum')

				expect(i5.tokens[3].params[2].content).toBe(20)
				expect(i5.tokens[3].params[2].type).toBe<FunctionTokenParamType>('number')
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

test('Inner object - imports', () => {
	const ast = parseAst()
	expect(ast.nodes).toHaveLength(2)

	const n0 = ast.nodes[0]
	expect(nodeIsGroup(n0)).toBe(true)
	if (nodeIsGroup(n0)) {
		expect(n0.nodes).toHaveLength(5)
		const i1 = n0.nodes[0]
		expect(i1.comment).toBe('comment 2.1')
		expect(i1.keys).toEqual(['outer', 'level11', 'level21'])
		if (nodeIsGroup(i1)) {
			expect(i1.nodes).toHaveLength(2)

			{
				const n1 = i1.nodes[0]
				expect(n1.comment).toBe('comment linked 1.1')
				expect(n1.keys).toEqual(['outer', 'level11', 'level21', 'levelLinked11'])
				if (nodeIsGroup(n1)) {
					expect(n1.nodes).toHaveLength(2)

					expect(n1.nodes[0].comment).toBe('comment linked 2.1')
					expect(n1.nodes[0].keys).toEqual([
						'outer',
						'level11',
						'level21',
						'levelLinked11',
						'levelLinked21',
					])
					if (nodeIsNoParams(n1.nodes[0])) {
						expect(n1.nodes[0].text).toBe('level-linked-21-string')
					} else {
						fail()
					}
					expect(n1.nodes[1].comment).toBe('comment linked 2.2')
					expect(n1.nodes[1].keys).toEqual([
						'outer',
						'level11',
						'level21',
						'levelLinked11',
						'levelLinked22',
					])
					if (nodeIsNoParams(n1.nodes[1])) {
						expect(n1.nodes[1].text).toBe('level-linked-22-string')
					} else {
						fail()
					}
				} else {
					fail()
				}
			}

			{
				const n2 = i1.nodes[1]
				expect(n2.comment).toBe('comment linked 1.2')
				expect(n2.keys).toEqual(['outer', 'level11', 'level21', 'levelLinked12'])
				if (nodeIsNoParams(n2)) {
					expect(n2.text).toBe('level-linked-12-string')
				} else {
					fail()
				}
			}
		} else {
			fail()
		}
	} else {
		fail()
	}
})
