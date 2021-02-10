import { parse } from '../src'
test('Parsing', () => {
	const ast = parse('./test/fixture/fixture.ts')
	console.log(ast)
})
