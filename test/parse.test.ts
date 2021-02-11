import {
	Ast,
	parseFile,
	isNumeric,
	isTextArray,
	isNumericArray,
	isGroup,
	isText,
	isTextTemplated,
	isNamedTuple,
} from '../src'
function parseAst(): Ast {
	const p = parseFile('./test/fixture/fixture.ts')
	if (p === undefined) {
		fail('Parsing failed.')
	}
	return p
}

test('Outer', () => {
	const ast = parseAst()
	expect(ast.keys).toEqual(['outer'])
	expect(ast.comment).toBe('comment 0')
	expect(ast.children).toHaveLength(6)
})

test('First inner', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(6)

	const n0 = ast.children[0]
	expect(n0.keys).toEqual(['outer', 'level11'])
	expect(n0.comment).toBe('comment 1.1')
	if (isGroup(n0)) {
		expect(n0.children).toHaveLength(5)
	} else {
		fail()
	}

	const n1 = ast.children[1]
	expect(n1.keys).toEqual(['outer', 'level12'])
	expect(n1.comment).toBe('comment 1.2')
	if (isText(n1)) {
		expect(n1.text).toBe('level12-string')
	} else {
		fail()
	}
})

test('Inner object - string', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(6)

	const n0 = ast.children[0]
	if (isGroup(n0)) {
		expect(n0.children).toHaveLength(5)
		const i2 = n0.children[1]
		expect(i2.comment).toBe('comment 2.2')
		expect(i2.keys).toEqual(['outer', 'level11', 'level22'])
		if (isText(i2)) {
			expect(i2.text).toBe('level22-string')
		} else {
			fail()
		}
	} else {
		fail()
	}
})

test('Inner object - numeric', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(6)

	const n = ast.children[2]
	if (isNumeric(n)) {
		expect(n.comment).toBe('comment 1.3')
		expect(n.keys).toEqual(['outer', 'level13'])
		expect(n.value).toEqual(5555)
	} else {
		fail()
	}
})

test('Inner object - string array', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(6)

	const n = ast.children[3]
	if (isTextArray(n)) {
		expect(n.comment).toBe('comment 1.4')
		expect(n.keys).toEqual(['outer', 'level14'])
		expect(n.texts).toEqual(['string1', 'string2', 'string3'])
	} else {
		fail()
	}
})

test('Inner object - numeric array', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(6)

	const n = ast.children[4]
	if (isNumericArray(n)) {
		expect(n.comment).toBe('comment 1.5')
		expect(n.keys).toEqual(['outer', 'level15'])
		expect(n.values).toEqual([111, 222, 333])
	} else {
		fail()
	}
})

test('Inner object - arrow function 1 arg', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(6)

	const n0 = ast.children[0]
	expect(isGroup(n0)).toBe(true)
	if (isGroup(n0)) {
		expect(n0.children).toHaveLength(5)
		const i3 = n0.children[2]
		expect(i3.comment).toBe('comment 2.3')
		expect(i3.keys).toEqual(['outer', 'level11', 'level23'])
		if (isTextTemplated(i3)) {
			expect(i3.tokens).toHaveLength(2)
			if (isText(i3.tokens[0])) {
				expect(i3.tokens[0].text).toBe('firstArg')
			} else {
				fail()
			}
			if (isText(i3.tokens[1])) {
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
	expect(ast.children).toHaveLength(6)

	const n0 = ast.children[0]
	expect(isGroup(n0)).toBe(true)
	if (isGroup(n0)) {
		expect(n0.children).toHaveLength(5)
		const i4 = n0.children[3]
		expect(i4.comment).toBe('comment 2.4')
		expect(i4.keys).toEqual(['outer', 'level11', 'level24'])
		if (isTextTemplated(i4)) {
			expect(i4.tokens).toHaveLength(4)
			if (isText(i4.tokens[0])) {
				expect(i4.tokens[0].text).toBe('firstArg')
			} else {
				fail()
			}
			if (isText(i4.tokens[1])) {
				expect(i4.tokens[1].text).toBe(' span string 1 ')
			} else {
				fail()
			}
			if (isText(i4.tokens[2])) {
				expect(i4.tokens[2].text).toBe('secondArg')
			} else {
				fail()
			}
			if (isText(i4.tokens[3])) {
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
	expect(ast.children).toHaveLength(6)

	const n0 = ast.children[0]
	expect(isGroup(n0)).toBe(true)
	if (isGroup(n0)) {
		expect(n0.children).toHaveLength(5)
		const i5 = n0.children[4]
		expect(i5.comment).toBe('comment 2.5')
		expect(i5.keys).toEqual(['outer', 'level11', 'level25'])
		if (isTextTemplated(i5)) {
			expect(i5.tokens).toHaveLength(4)
			if (isText(i5.tokens[0])) {
				expect(i5.tokens[0].text).toBe('span string 1 ')
			} else {
				fail()
			}
			if (isNamedTuple(i5.tokens[1])) {
				expect(i5.tokens[1].tupleName).toBe('LitFunc')
				expect(i5.tokens[1].params).toHaveLength(3)

				if (isText(i5.tokens[1].params[0])) {
					expect(i5.tokens[1].params[0].text).toBe('firstArg')
				} else {
					fail()
				}
				if (isText(i5.tokens[1].params[1])) {
					expect(i5.tokens[1].params[1].text).toBe('En1')
				} else {
					fail()
				}
				if (isNumeric(i5.tokens[1].params[2])) {
					expect(i5.tokens[1].params[2].value).toBe(10)
				} else {
					fail()
				}
			} else {
				fail()
			}
			if (isText(i5.tokens[2])) {
				expect(i5.tokens[2].text).toBe(' span string 2 ')
			} else {
				fail()
			}
			if (isNamedTuple(i5.tokens[3])) {
				expect(i5.tokens[3].tupleName).toBe('LitFunc')
				expect(i5.tokens[3].params).toHaveLength(3)

				if (isText(i5.tokens[3].params[0])) {
					expect(i5.tokens[3].params[0].text).toBe('secondArg')
				} else {
					fail()
				}
				if (isText(i5.tokens[3].params[1])) {
					expect(i5.tokens[3].params[1].text).toBe('En2')
				} else {
					fail()
				}
				if (isNumeric(i5.tokens[3].params[2])) {
					expect(i5.tokens[3].params[2].value).toBe(20)
				} else {
					fail()
				}
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
	expect(ast.children).toHaveLength(6)

	const n0 = ast.children[0]
	expect(isGroup(n0)).toBe(true)
	if (isGroup(n0)) {
		expect(n0.children).toHaveLength(5)
		const i1 = n0.children[0]
		expect(i1.comment).toBe('comment 2.1')
		expect(i1.keys).toEqual(['outer', 'level11', 'level21'])
		if (isGroup(i1)) {
			expect(i1.children).toHaveLength(2)

			{
				const n1 = i1.children[0]
				expect(n1.comment).toBe('comment linked 1.1')
				expect(n1.keys).toEqual(['outer', 'level11', 'level21', 'levelLinked11'])
				if (isGroup(n1)) {
					expect(n1.children).toHaveLength(2)

					expect(n1.children[0].comment).toBe('comment linked 2.1')
					expect(n1.children[0].keys).toEqual([
						'outer',
						'level11',
						'level21',
						'levelLinked11',
						'levelLinked21',
					])
					if (isText(n1.children[0])) {
						expect(n1.children[0].text).toBe('level-linked-21-string')
					} else {
						fail()
					}
					expect(n1.children[1].comment).toBe('comment linked 2.2')
					expect(n1.children[1].keys).toEqual([
						'outer',
						'level11',
						'level21',
						'levelLinked11',
						'levelLinked22',
					])
					if (isText(n1.children[1])) {
						expect(n1.children[1].text).toBe('level-linked-22-string')
					} else {
						fail()
					}
				} else {
					fail()
				}
			}

			{
				const n2 = i1.children[1]
				expect(n2.comment).toBe('comment linked 1.2')
				expect(n2.keys).toEqual(['outer', 'level11', 'level21', 'levelLinked12'])
				if (isText(n2)) {
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
