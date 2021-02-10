import { BaseNode, Group, NoParams, WithParams } from './interface'

export function nodeIsGroup(bn: BaseNode): bn is Group {
	return 'nodes' in bn
}
export function nodeIsNoParams(bn: BaseNode): bn is NoParams {
	return 'text' in bn
}

export function nodeIsWithParams(bn: BaseNode): bn is WithParams {
	return 'params' in bn && 'tokens' in bn
}
