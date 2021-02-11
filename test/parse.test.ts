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
	isBool,
	isBoolArray,
} from '../src'
function parseAst(): Ast {
	const p = parseFile('./test/fixture/fixture.ts')
	return p
}

test('Outer', () => {
	const ast = parseAst()
	expect(ast.keys).toEqual(['outer'])
	expect(ast.comment).toBe('comment 0')
	expect(ast.children).toHaveLength(10)
})

test('First inner', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

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

test('Text', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

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

test('Numeric', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n = ast.children[2]
	if (isNumeric(n)) {
		expect(n.comment).toBe('comment 1.3')
		expect(n.keys).toEqual(['outer', 'level13'])
		expect(n.value).toEqual(5555)
	} else {
		fail()
	}
})

test('Text Array', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n = ast.children[3]
	if (isTextArray(n)) {
		expect(n.comment).toBe('comment 1.4')
		expect(n.keys).toEqual(['outer', 'level14'])
		expect(n.texts).toEqual(['string1', 'string2', 'string3'])
	} else {
		fail()
	}
})

test('Number Array', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n = ast.children[4]
	if (isNumericArray(n)) {
		expect(n.comment).toBe('comment 1.5')
		expect(n.keys).toEqual(['outer', 'level15'])
		expect(n.values).toEqual([111, 222, 333])
	} else {
		fail()
	}
})

test('Boolean', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n = ast.children[5]
	if (isBool(n)) {
		expect(n.comment).toBe('comment 1.6')
		expect(n.keys).toEqual(['outer', 'level16'])
		expect(n.bool).toEqual(true)
	} else {
		fail()
	}
})

test('Boolean Array', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n = ast.children[6]
	if (isBoolArray(n)) {
		expect(n.comment).toBe('comment 1.7')
		expect(n.keys).toEqual(['outer', 'level17'])
		expect(n.bools).toEqual([true, false, true])
	} else {
		fail()
	}
})

test('Named Tuple', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n = ast.children[7]
	if (isNamedTuple(n)) {
		expect(n.comment).toBe('comment 1.8')
		expect(n.keys).toEqual(['outer', 'level18'])
		expect(n.tupleName).toEqual('LitFunc')
		expect(n.params).toHaveLength(3)
		if (isText(n.params[0])) {
			expect(n.params[0].text).toBe('string1')
		} else {
			fail()
		}
		if (isText(n.params[1])) {
			expect(n.params[1].text).toBe('En1')
		} else {
			fail()
		}
		if (isNumeric(n.params[2])) {
			expect(n.params[2].value).toBe(555)
		} else {
			fail()
		}
	} else {
		fail()
	}
})

test('Enum as Text', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n = ast.children[8]
	if (isText(n)) {
		expect(n.comment).toBe('comment 1.9')
		expect(n.keys).toEqual(['outer', 'level19'])
		expect(n.text).toEqual('En1')
	} else {
		fail()
	}
})

test('Enum Array as Text Array', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n = ast.children[9]
	if (isTextArray(n)) {
		expect(n.comment).toBe('comment 1.10')
		expect(n.keys).toEqual(['outer', 'level110'])
		expect(n.texts).toEqual(['En1', 'En2'])
	} else {
		fail()
	}
})

test('Arrow function 1 arg', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n0 = ast.children[0]
	expect(isGroup(n0)).toBe(true)
	if (isGroup(n0)) {
		expect(n0.children).toHaveLength(5)
		const i3 = n0.children[2]
		expect(i3.comment).toBe('comment 2.3')
		expect(i3.keys).toEqual(['outer', 'level11', 'level23'])
		if (isTextTemplated(i3)) {
			expect(i3.tokens).toHaveLength(2)
			if (typeof i3.tokens[0] !== 'string' && isText(i3.tokens[0])) {
				expect(i3.tokens[0].text).toBe('firstArg')
			} else {
				fail()
			}
			if (typeof i3.tokens[1] === 'string') {
				expect(i3.tokens[1]).toBe(' span string 1')
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

test('Arrow function 2 args', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n0 = ast.children[0]
	expect(isGroup(n0)).toBe(true)
	if (isGroup(n0)) {
		expect(n0.children).toHaveLength(5)
		const i4 = n0.children[3]
		expect(i4.comment).toBe('comment 2.4')
		expect(i4.keys).toEqual(['outer', 'level11', 'level24'])
		if (isTextTemplated(i4)) {
			expect(i4.tokens).toHaveLength(4)
			if (typeof i4.tokens[0] !== 'string' && isText(i4.tokens[0])) {
				expect(i4.tokens[0].text).toBe('firstArg')
			} else {
				fail()
			}
			if (typeof i4.tokens[1] === 'string') {
				expect(i4.tokens[1]).toBe(' span string 1 ')
			} else {
				fail()
			}
			if (typeof i4.tokens[2] !== 'string' && isText(i4.tokens[2])) {
				expect(i4.tokens[2].text).toBe('secondArg')
			} else {
				fail()
			}
			if (typeof i4.tokens[3] === 'string') {
				expect(i4.tokens[3]).toBe(' span string 2')
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

test('Arrow function with literal function', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

	const n0 = ast.children[0]
	expect(isGroup(n0)).toBe(true)
	if (isGroup(n0)) {
		expect(n0.children).toHaveLength(5)
		const i5 = n0.children[4]
		expect(i5.comment).toBe('comment 2.5')
		expect(i5.keys).toEqual(['outer', 'level11', 'level25'])
		if (isTextTemplated(i5)) {
			expect(i5.tokens).toHaveLength(4)
			if (typeof i5.tokens[0] === 'string') {
				expect(i5.tokens[0]).toBe('span string 1 ')
			} else {
				fail()
			}
			if (typeof i5.tokens[1] !== 'string' && isNamedTuple(i5.tokens[1])) {
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
			if (typeof i5.tokens[2] === 'string') {
				expect(i5.tokens[2]).toBe(' span string 2 ')
			} else {
				fail()
			}
			if (typeof i5.tokens[3] !== 'string' && isNamedTuple(i5.tokens[3])) {
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

test('Imports', () => {
	const ast = parseAst()
	expect(ast.children).toHaveLength(10)

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
