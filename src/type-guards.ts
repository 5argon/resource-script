import {
	Sup,
	Group,
	Text,
	TextTemplated,
	Numeric,
	TextArray,
	NumericArray,
	Bool,
	BoolArray,
	NamedTuple,
} from './interface'

export function isGroup(bn: Sup): bn is Group {
	return 'children' in bn
}
export function isText(bn: Sup): bn is Text {
	return 'text' in bn
}
export function isTextArray(bn: Sup): bn is TextArray {
	return 'texts' in bn
}
export function isNumeric(bn: Sup): bn is Numeric {
	return 'value' in bn
}
export function isNumericArray(bn: Sup): bn is NumericArray {
	return 'values' in bn
}
export function isBool(bn: Sup): bn is Bool {
	return 'bool' in bn
}
export function isBoolArray(bn: Sup): bn is BoolArray {
	return 'bools' in bn
}
export function isTextTemplated(bn: Sup): bn is TextTemplated {
	return 'params' in bn && 'tokens' in bn
}
export function isNamedTuple(bn: Sup): bn is NamedTuple {
	return 'tupleName' in bn && 'params' in bn
}
