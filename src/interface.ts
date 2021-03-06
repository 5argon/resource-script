/**
 * `Ast` is also counted as a `Group` so imports can be joined into the current tree.
 */
export type Ast = Group & BaseNode

export type ValueNode = Value & BaseNode

export interface BaseNode {
  comment: string | undefined
  /**
   * The `@see` inside comment ordered left to right, top to bottom.
   */
  tags: Tag[]
  /**
   * Collected hierarchical keys from root parent leading to this node.
   */
  keys: string[]
}

export interface Tag {
  tagName: string
  value: undefined | string | number
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
  tokens: TemplateSpan[]
}

export interface Params {
  text: string
  type: SupportedType
}

/**
 * Use `isCustomType` to differentiate custom type.
 */
export type SupportedType = 'string' | 'number' | 'boolean' | CustomType

export interface CustomType {
  custom: string
}

/**
 * Template span means each item in the template string.
 * This ```Hello ${name} world``` contains 3 spans : `Hello `, `name`, ` world`
 *
 * Text span means anything not in the `${}` and thus a simple `string`.
 * But if an identifier is in `${}` then it is a text anyways but bundled in `Text`.
 */
export type TemplateSpan = TextSpan | Value
export type TextSpan = string

export interface NamedTuple {
  tupleName: string
  params: NamedTupleParam[]
}
export type NamedTupleParam = Value
