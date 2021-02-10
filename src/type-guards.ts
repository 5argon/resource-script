import {
	BaseNode,
	FunctionToken,
	Group,
	Text,
	ParamToken,
	TextToken,
	Token,
	TextParams,
	Numeric,
	TextArray,
	NumericArray,
} from './interface'

export function nodeIsGroup(bn: BaseNode): bn is Group {
	return 'nodes' in bn
}
export function nodeIsText(bn: BaseNode): bn is Text {
	return 'text' in bn
}
export function nodeIsTextParams(bn: BaseNode): bn is TextParams {
	return 'params' in bn && 'tokens' in bn
}
export function nodeIsNumeric(bn: BaseNode): bn is Numeric {
	return 'value' in bn
}
export function nodeIsTextArray(bn: BaseNode): bn is TextArray {
	return 'texts' in bn
}
export function nodeIsNumericArray(bn: BaseNode): bn is NumericArray {
	return 'values' in bn
}

export function tokenIsTextToken(tk: Token): tk is TextToken {
	return 'text' in tk
}
export function tokenIsParamToken(tk: Token): tk is ParamToken {
	return 'paramName' in tk
}
export function tokenIsFunctionToken(tk: Token): tk is FunctionToken {
	return 'functionName' in tk
}
