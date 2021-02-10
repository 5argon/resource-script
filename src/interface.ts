export type Ast = Group

export type NodeType = Group | Simple | WithArgs

export interface Group extends BaseNode {
	nodes: NodeType[]
}

export interface Simple extends BaseNode {
	value: string
}

export interface WithArgs extends BaseNode {
	args: Arg[]
	value: string
}

export interface Arg {
	name: string
	type: ArgType
}

export type ArgType = 'string' | 'number' | 'date' | 'unsupported'

export interface BaseNode {
	comment: string | undefined
	name: string[]
}
