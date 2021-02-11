/**
 * `Ast` is also counted as a `Group` so imports can be joined into the current tree.
 */
export type Ast = Group & BaseNode

export type ValueNode = Value & BaseNode

export interface BaseNode {
	comment: string | undefined
	/**
	 * Collected hierarchical keys from root parent leading to this node.
	 */
	keys: string[]
}

/**
 * Use type guards to differentiate these possible values.
 */
export type Value =
	| Group
	| Text
	| TextArray
	| TextTemplated
	| Numeric
	| NumericArray
	| Bool
	| BoolArray
	| NamedTuple

// -----

/**
 * Nesting into the same type.
 */
export interface Group {
	children: ValueNode[]
}

export interface Text {
	text: string
}

export interface TextArray {
	texts: string[]
}

export interface Numeric {
	value: number
}

export interface NumericArray {
	values: number[]
}

export interface Bool {
	bool: boolean
}

export interface BoolArray {
	bools: boolean[]
}

export interface TextTemplated {
	/**
	 * Left side of arrow function.
	 */
	params: Params[]
	/**
	 * Right side of arrow function. From left to right, delimited by transition from normal string to ${}.
	 * Everything not in `${}` considered as text.
	 */
	tokens: Token[]
}

export interface Params {
	text: string
	type: SupportedType
}

export type SupportedType = 'string' | 'number' | 'boolean' | 'enum' | { custom: string }

export type Token = Value

export interface NamedTuple {
	tupleName: string
	params: NamedTupleParam[]
}
export type NamedTupleParam = Value
