/**
 * `Ast` is also counted as a `Group` so imports can be joined into the current tree.
 */
export type Ast = Group

export type TreeItem = Group | Text | TextParams | Numeric | TextArray | NumericArray

/**
 * Nesting into the same type.
 */
export interface Group extends BaseNode {
	nodes: TreeItem[]
}

export interface Text extends BaseNode {
	text: string
}

export interface Numeric extends BaseNode {
	value: number
}

export interface TextArray extends BaseNode {
	texts: string[]
}

export interface NumericArray extends BaseNode {
	values: number[]
}

/**
 * When using arrow function that produces a template literal.
 */
export interface TextParams extends BaseNode {
	params: Params[]
	/**
	 * Lined up from left to right. Concatenate them to get the full string.
	 */
	tokens: Token[]
}

export type Token = TextToken | ParamToken | FunctionToken
export interface TextToken {
	text: string
}
export interface ParamToken {
	paramName: string
}
export interface FunctionToken {
	functionName: string
	params: FunctionTokenParam[]
}
export interface FunctionTokenParam {
	content: string | number
	type: FunctionTokenParamType
}

export type FunctionTokenParamType = 'string' | 'number' | 'date' | 'boolean' | 'enum'

export interface Params {
	text: string
	type: ParamType
}

export type ParamType = 'string' | 'number' | 'date' | 'boolean' | 'enum'

export interface BaseNode {
	comment: string | undefined
	/**
	 * Collected hierarchical keys from root parent leading to this node.
	 */
	keys: string[]
}
