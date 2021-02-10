/**
 * `Ast` is also counted as a `Group` so imports can be joined into the current tree.
 */
export type Ast = Group

export type TreeItem = Group | NoParams | WithParams

/**
 * Nesting into the same type.
 */
export interface Group extends BaseNode {
	nodes: TreeItem[]
}

/**
 * When using a simple string.
 */
export interface NoParams extends BaseNode {
	text: string
}

/**
 * When using arrow function that produces a template literal.
 */
export interface WithParams extends BaseNode {
	params: Params[]
	/**
	 * Lined up from left to right. Concatenate them to get the full string.
	 */
	tokens: Token[]
}

export type Token = Simple | Var | FakeFunc
type Simple = string
type Var = string
interface FakeFunc {
	functionName: string
	params: FakeFuncParam[]
}
export interface FakeFuncParam {
	content: string | number
	type: 'string' | 'number' | 'enum' | 'unsupported'
}

export interface Params {
	text: string
	type: ParamType
}

export type ParamType = 'string' | 'number' | 'date' | 'unsupported'

export interface BaseNode {
	comment: string | undefined
	/**
	 * Collected hierarchical keys from root parent leading to this node.
	 */
	keys: string[]
}
