import {
	BaseNode,
	FunctionToken,
	Group,
	NoParams,
	ParamToken,
	TextToken,
	Token,
	WithParams,
} from './interface'

export function nodeIsGroup(bn: BaseNode): bn is Group {
	return 'nodes' in bn
}
export function nodeIsNoParams(bn: BaseNode): bn is NoParams {
	return 'text' in bn
}

export function nodeIsWithParams(bn: BaseNode): bn is WithParams {
	return 'params' in bn && 'tokens' in bn
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
