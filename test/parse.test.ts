import { Ast, nodeIsGroup, nodeIsNoParams, parse } from '../src'
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

test('Inner 1', () => {
	const ast = parseAst()
	expect(ast.nodes).toHaveLength(2)

	const n0 = ast.nodes[0]
	expect(n0.keys).toEqual(['outer', 'level11'])
	expect(n0.comment).toBe('comment 1.1')
	expect(nodeIsGroup(n0)).toBe(true)
	if (nodeIsGroup(n0)) {
		expect(n0.nodes).toHaveLength(5)
	}

	const n1 = ast.nodes[1]
	expect(n1.keys).toEqual(['outer', 'level12'])
	expect(n1.comment).toBe('comment 1.2')
	expect(nodeIsNoParams(n1)).toBe(true)
	if (nodeIsNoParams(n1)) {
		expect(n1.text).toBe('level12-string')
	}
})
