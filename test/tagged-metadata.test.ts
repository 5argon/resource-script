import { Ast, parseFile } from '../src'

function parseAst(): Ast {
  const p = parseFile('./test/fixture/tagged-metadata.rs.ts')
  expect(p.children).toHaveLength(14)
  return p
}

const flagTag = 'flagTag'
const flagTag2 = 'flagTag2'
const stringTag = 'stringTag'
const numberTag = 'numberTag'

test('Flag', () => {
  const ast = parseAst()
  const n = ast.children[0]
  expect(n.keys).toEqual(['taggedMetadata', 'level11'])
  expect(n.comment).toBe('level11-comment')
  expect(n.tags).toHaveLength(1)
  expect(n.tags[0].tagName).toBe(flagTag)
  expect(n.tags[0].value).toBe(undefined)
})

test('Number', () => {
  const ast = parseAst()
  const n = ast.children[1]
  expect(n.keys).toEqual(['taggedMetadata', 'level12'])
  expect(n.comment).toBe('level12-comment')
  expect(n.tags).toHaveLength(1)
  expect(n.tags[0].tagName).toBe(numberTag)
  expect(n.tags[0].value).toBe(10)
})

test('String', () => {
  const ast = parseAst()
  const n = ast.children[2]
  expect(n.keys).toEqual(['taggedMetadata', 'level13'])
  expect(n.comment).toBe('level13-comment')
  expect(n.tags).toHaveLength(1)
  expect(n.tags[0].tagName).toBe(stringTag)
  expect(n.tags[0].value).toBe('string tag with spaces')
})

test('Multiple inline 1', () => {
  const ast = parseAst()
  const n = ast.children[3]
  expect(n.keys).toEqual(['taggedMetadata', 'level14'])
  expect(n.comment).toBe('level14-comment')
  expect(n.tags).toHaveLength(3)
  expect(n.tags[0].tagName).toBe(stringTag)
  expect(n.tags[0].value).toBe('string tag with spaces')
  expect(n.tags[1].tagName).toBe(flagTag)
  expect(n.tags[1].value).toBe(undefined)
  expect(n.tags[2].tagName).toBe(numberTag)
  expect(n.tags[2].value).toBe(10)
})

test('Multiple inline 2', () => {
  const ast = parseAst()
  const n = ast.children[4]
  expect(n.keys).toEqual(['taggedMetadata', 'level15'])
  expect(n.comment).toBe('level15-comment')
  expect(n.tags).toHaveLength(3)
  expect(n.tags[0].tagName).toBe(flagTag)
  expect(n.tags[0].value).toBe(undefined)
  expect(n.tags[1].tagName).toBe(numberTag)
  expect(n.tags[1].value).toBe(10)
  expect(n.tags[2].tagName).toBe(stringTag)
  expect(n.tags[2].value).toBe('string tag with spaces')
})

test('Multiple separate lines 1', () => {
  const ast = parseAst()
  const n = ast.children[5]
  expect(n.keys).toEqual(['taggedMetadata', 'level16'])
  expect(n.comment).toBe('level16-comment')
  expect(n.tags).toHaveLength(3)
  expect(n.tags[0].tagName).toBe(flagTag)
  expect(n.tags[0].value).toBe(undefined)
  expect(n.tags[1].tagName).toBe(numberTag)
  expect(n.tags[1].value).toBe(10)
  expect(n.tags[2].tagName).toBe(stringTag)
  expect(n.tags[2].value).toBe('string tag with spaces')
})

test('Multiple separate lines 2', () => {
  const ast = parseAst()
  const n = ast.children[13]
  expect(n.keys).toEqual(['taggedMetadata', 'level114'])
  expect(n.comment).toBe('level114-comment')
  expect(n.tags).toHaveLength(3)
  expect(n.tags[0].tagName).toBe(numberTag)
  expect(n.tags[0].value).toBe(10)
  expect(n.tags[1].tagName).toBe(stringTag)
  expect(n.tags[1].value).toBe('string tag with spaces')
  expect(n.tags[2].tagName).toBe(flagTag)
  expect(n.tags[2].value).toBe(undefined)
})

test('Number floating', () => {
  const ast = parseAst()
  const n = ast.children[6]
  expect(n.keys).toEqual(['taggedMetadata', 'level17'])
  expect(n.comment).toBe('level17-comment')
  expect(n.tags).toHaveLength(1)
  expect(n.tags[0].tagName).toBe(numberTag)
  expect(n.tags[0].value).toBe(123.4567)
})

test('No tag', () => {
  const ast = parseAst()
  const n = ast.children[7]
  expect(n.keys).toEqual(['taggedMetadata', 'level18'])
  expect(n.comment).toBe('level18-comment')
  expect(n.tags).toHaveLength(0)
})

test('Just tag', () => {
  const ast = parseAst()
  const n = ast.children[8]
  expect(n.keys).toEqual(['taggedMetadata', 'level19'])
  expect(n.comment).toBe(undefined)
  expect(n.tags).toHaveLength(1)
  expect(n.tags[0].tagName).toBe(numberTag)
  expect(n.tags[0].value).toBe(10)
})

test('Missing tag', () => {
  const ast = parseAst()
  const n = ast.children[9]
  expect(n.keys).toEqual(['taggedMetadata', 'level110'])
  expect(n.comment).toBe(undefined)
  expect(n.tags).toHaveLength(0)
})

test('Multiline comment with tag', () => {
  const ast = parseAst()
  const n = ast.children[10]
  expect(n.keys).toEqual(['taggedMetadata', 'level111'])
  expect(n.comment).toBe('level111-comment-1\nlevel111-comment-2')
  expect(n.tags).toHaveLength(1)
  expect(n.tags[0].tagName).toBe(numberTag)
  expect(n.tags[0].value).toBe(10)
})

test('Multiple flags 1', () => {
  const ast = parseAst()
  const n = ast.children[11]
  expect(n.keys).toEqual(['taggedMetadata', 'level112'])
  expect(n.comment).toBe(undefined)
  expect(n.tags).toHaveLength(2)
  expect(n.tags[0].tagName).toBe(flagTag)
  expect(n.tags[0].value).toBe(undefined)
  expect(n.tags[1].tagName).toBe(flagTag2)
  expect(n.tags[1].value).toBe(undefined)
})

test('Multiple flags 2', () => {
  const ast = parseAst()
  const n = ast.children[12]
  expect(n.keys).toEqual(['taggedMetadata', 'level113'])
  expect(n.comment).toBe(undefined)
  expect(n.tags).toHaveLength(2)
  expect(n.tags[0].tagName).toBe(flagTag)
  expect(n.tags[0].value).toBe(undefined)
  expect(n.tags[1].tagName).toBe(flagTag2)
  expect(n.tags[1].value).toBe(undefined)
})
