import { Ast, Value, ValueNode } from './interface'
import {
	isBool,
	isBoolArray,
	isGroup,
	isNamedTuple,
	isNumeric,
	isNumericArray,
	isText,
	isTextArray,
	isTextTemplated,
} from './type-guards'

type JSON = { [k: string]: any }

/**
 * Simple adaptor to `JSON.stringify`.
 *
 * If `enableComment`, adds `"comment"` field **inside** the JSON object for every comment
 * found over "group" in Resource Script. (Keys with object on the right side to nest deeper.)
 *
 * Comments in any other places doesn't match up well to JSON and are just ignored.
 *
 * (Beware of collisions with your own keys named "comment")
 */
export function astToJSON(ast: Ast, enableComment?: boolean): string {
	const jsObject = processChildren(ast.children, enableComment)
	return JSON.stringify(jsObject, null, 2)

	function realKey(k: string[]) {
		return k[k.length - 1]
	}

	function valueToString(x: Value): string {
		if (isText(x)) {
			return x.text
		}
		if (isTextArray(x)) {
			return x.texts.toString()
		}
		if (isNumeric(x)) {
			return x.value.toString()
		}
		if (isNumericArray(x)) {
			return x.values.toString()
		}
		if (isNumericArray(x)) {
			return x.values.toString()
		}
		if (isBool(x)) {
			return x.bool ? 'true' : 'false'
		}
		if (isBoolArray(x)) {
			return x.bools.toString()
		}
		if (isNamedTuple(x)) {
			const concatParams = x.params
				.map<string>((x) => valueToString(x))
				.join(', ')
			return x.tupleName + '(' + concatParams + ')'
		}
		return ''
	}

	function processChildren(v: ValueNode[], enableComment?: boolean): JSON {
		const ob: JSON = {}
		v.forEach((x) => {
			const k = realKey(x.keys)
			if (isGroup(x)) {
				const result = processChildren(x.children, enableComment)
				if (enableComment && x.comment !== undefined) {
					result['comment'] = x.comment
				}
				ob[k] = result
			}
			if (isText(x)) {
				ob[k] = x.text
			}
			if (isTextArray(x)) {
				ob[k] = x.texts
			}
			if (isNumeric(x)) {
				ob[k] = x.value
			}
			if (isNumericArray(x)) {
				ob[k] = x.values
			}
			if (isNumericArray(x)) {
				ob[k] = x.values
			}
			if (isBool(x)) {
				ob[k] = x.bool
			}
			if (isBoolArray(x)) {
				ob[k] = x.bools
			}
			if (isTextTemplated(x)) {
				const mapped = x.tokens
					.map<string>((x) => {
						if (typeof x === 'string') {
							return x
						}
						return '{' + valueToString(x) + '}'
					})
					.join('')
				ob[k] = mapped
			}
			if (isNamedTuple(x)) {
				const concatParams = x.params
					.map<string>((x) => valueToString(x))
					.join(', ')
				ob[k] = x.tupleName + '(' + concatParams + ')'
			}
		})
		return ob
	}
}
