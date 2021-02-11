import * as ts from 'typescript'
import * as utils from 'tsutils'
import {
	Params,
	Ast,
	Group,
	ValueNode,
	Text,
	TextTemplated,
	Token,
	Numeric,
	TextArray,
	NumericArray,
	Bool,
	BoolArray,
	NamedTupleParam,
	Sup,
	NamedTuple,
} from './interface'
import path from 'path'

type ImportMap = { [k: string]: string }

export function processString(fileContent: string): Ast {
	const sf = ts.createSourceFile('dummy.ts', fileContent, ts.ScriptTarget.ES2020)
	return process([], 0, sf, '')
}

/**
 * Called on the first entry and also when traversing into new imports.
 */
export function processFile(filePath: string, parents: string[], depth: number): Ast {
	const program = ts.createProgram({ rootNames: [filePath], options: {} })
	const sf = program.getSourceFile(filePath)
	if (sf === undefined) {
		throw new Error('File not found at ' + filePath)
	}
	const dir = path.dirname(filePath)
	return process(parents, depth, sf, dir)
}

export function process(parents: string[], depth: number, sf: ts.SourceFile, dir: string): Ast {
	let comment: string | undefined = undefined
	let name: string = ''
	let nodes: ValueNode[] = []
	let im: ImportMap = {}
	let newParent: string[] = [...parents]

	ts.forEachChild(sf, (node) => {
		if (ts.isImportDeclaration(node)) {
			const ic = node.importClause
			const ms = node.moduleSpecifier
			if (ic !== undefined && ic.name !== undefined && ts.isStringLiteral(ms)) {
				im[ic.name.escapedText.toString()] = ms.text
			}
		}
		if (ts.isVariableStatement(node)) {
			comment = getComment(node, sf)
			const decs = node.declarationList.declarations
			if (decs.length > 0) {
				const dec = decs[0]
				if (ts.isIdentifier(dec.name) && depth === 0) {
					name = dec.name.text
					newParent.push(name)
				}
				if (dec.initializer) {
					if (ts.isObjectLiteralExpression(dec.initializer)) {
						nodes = processObjectLiteral(dec.initializer, newParent, sf, im, dir, depth)
					}
				}
			}
		}
		// Silently pass all other top level declarations.
		// User can declare other helpers creatively.
	})
	const ast: Ast = { children: nodes, comment: comment, keys: newParent }
	return ast
}

function propAss(
	c: ts.PropertyAssignment,
	parents: string[],
	sf: ts.SourceFile,
	im: ImportMap,
	currentDirectory: string,
	currentDepth: number,
): ValueNode {
	const newParents = [...parents]
	const name: string = ts.isIdentifier(c.name) ? c.name.text : ''
	const comment = getComment(c, sf)
	newParents.push(name)
	const initializer = c.initializer
	const sup = processExpression(
		initializer,
		newParents,
		sf,
		im,
		currentDirectory,
		currentDepth,
		true,
	)
	return { ...sup, comment: comment, keys: newParents }
}

function processExpression(
	exp: ts.Expression,
	parents: string[],
	sf: ts.SourceFile,
	im: ImportMap,
	dir: string,
	depth: number,
	identifierAsImports: boolean,
): Sup {
	if (ts.isObjectLiteralExpression(exp)) {
		const nodes = processObjectLiteral(exp, parents, sf, im, dir, depth)
		const ret: Group = {
			children: nodes,
		}
		return ret
	}
	if (ts.isIdentifier(exp)) {
		const identName = exp.text
		if (identifierAsImports) {
			if (identName in im) {
				const p = path.join(dir, im[identName] + '.ts')
				const ast = processFile(p, parents, depth + 1)
				if (ast !== null) {
					const ret: Group = {
						children: ast.children,
					}
					return ret
				} else {
					throw new Error('Failed resolving to path ' + p)
				}
			}
		} else {
			const ret: Text = {
				text: identName,
			}
			return ret
		}
	}
	if (ts.isStringLiteral(exp)) {
		const ret: Text = {
			text: exp.text,
		}
		return ret
	}
	if (ts.isNumericLiteral(exp)) {
		const ret: Numeric = {
			value: parseInt(exp.text, 10),
		}
		return ret
	}
	if (exp.kind === ts.SyntaxKind.TrueKeyword) {
		const ret: Bool = {
			bool: true,
		}
		return ret
	}
	if (exp.kind === ts.SyntaxKind.FalseKeyword) {
		const ret: Bool = {
			bool: false,
		}
		return ret
	}
	if (ts.isArrayLiteralExpression(exp)) {
		if (exp.elements.length === 0) {
			throw new Error('Array value must have at least 1 element.')
		}
		const firstElement = exp.elements[0]
		if (ts.isStringLiteral(firstElement)) {
			const collect: string[] = []
			exp.elements.forEach((x) => {
				if (ts.isStringLiteral(x)) {
					collect.push(x.text)
				} else {
					throw new Error('String array must be entirely of the same type.')
				}
			})
			const ret: TextArray = {
				texts: collect,
			}
			return ret
		} else if (ts.isNumericLiteral(firstElement)) {
			const collect: number[] = []
			exp.elements.forEach((x) => {
				if (ts.isNumericLiteral(x)) {
					collect.push(parseInt(x.text, 10))
				} else {
					throw new Error('Number array must be entirely of the same type.')
				}
			})
			const ret: NumericArray = {
				values: collect,
			}
			return ret
		} else if (
			firstElement.kind === ts.SyntaxKind.TrueKeyword ||
			firstElement.kind === ts.SyntaxKind.FalseKeyword
		) {
			const collect: boolean[] = []
			exp.elements.forEach((x) => {
				if (firstElement.kind === ts.SyntaxKind.TrueKeyword) {
					collect.push(true)
				} else if (firstElement.kind === ts.SyntaxKind.FalseKeyword) {
					collect.push(false)
				} else {
					throw new Error('Boolean array must be entirely of the same type.')
				}
			})
			const ret: BoolArray = {
				bools: collect,
			}
			return ret
		} else {
			throw new Error('Array value must be all strings, numbers, or booleans (same type).')
		}
	}
	// Arrow function as templated string
	if (ts.isArrowFunction(exp)) {
		const args: Params[] = exp.parameters.map<Params>((x) => {
			return parseArrowFunctionParams(x)
		})
		const body = exp.body
		const tokens: Token[] = []
		if (ts.isTemplateExpression(body)) {
			tokens.push(...processTemplateExpression(body, parents, sf, im, dir, depth))
		}
		const ret: TextTemplated = {
			params: args,
			tokens: tokens,
		}
		return ret
	}
	// Enum as string
	if (ts.isPropertyAccessExpression(exp)) {
		const iden: string = ts.isIdentifier(exp.name)
			? exp.name.text
			: ts.isPrivateIdentifier(exp.name)
			? exp.name.text
			: ''
		const ret: Text = {
			text: iden,
		}
		return ret
	}
	// Function as tuples
	if (ts.isCallExpression(exp)) {
		const lhs = exp.expression
		let funcName = ''
		if (ts.isIdentifier(lhs)) {
			funcName = lhs.text
		}
		const ffp = exp.arguments.map<NamedTupleParam>((x) => {
			return processExpression(exp, parents, sf, im, dir, depth, false)
		})
		const ret: NamedTuple = {
			tupleName: funcName,
			params: ffp,
		}
		return ret
	}
	throw new Error(
		"The right side of object's key must be one of these : string, string array, number, number array, boolean, boolean array, function (tuples), arrow function (templated string), object (nesting), identifier (imports). Error occurs at key : " +
			parents.join('-'),
	)
}

function processTemplateExpression(
	t: ts.TemplateExpression,
	parents: string[],
	sf: ts.SourceFile,
	im: ImportMap,
	dir: string,
	depth: number,
): Token[] {
	const collect: Token[] = []
	if (t.head.text !== '') {
		collect.push({ text: t.head.text })
	}
	t.templateSpans.forEach((x) => {
		const sup = processExpression(x.expression, parents, sf, im, dir, depth, false)
		collect.push(sup)
		// The remaining string of this span
		if (x.literal.text !== '') {
			collect.push({ text: x.literal.text })
		}
	})
	return collect
}

/**
 * Maps arrow function params into supported type token in the AST.
 */
function parseArrowFunctionParams(x: ts.ParameterDeclaration): Params {
	if (ts.isIdentifier(x.name)) {
		const name: string = x.name.text
		const t = x.type
		if (!t) {
			throw new Error("Must define a type on the arrow function's parameters.")
		}
		if (ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName)) {
			const par: Params = {
				text: name,
				type: { custom: t.typeName.text },
			}
			return par
		}
		switch (t.kind) {
			case ts.SyntaxKind.NumberKeyword: {
				const par: Params = {
					text: name,
					type: 'number',
				}
				return par
			}
			case ts.SyntaxKind.StringKeyword: {
				const par: Params = {
					text: name,
					type: 'string',
				}
				return par
			}
			case ts.SyntaxKind.BooleanKeyword: {
				const par: Params = {
					text: name,
					type: 'boolean',
				}
				return par
			}
			default: {
				throw new Error(
					"Arrow function's parameter must be of type : string, number, boolean, or a single type reference.",
				)
			}
		}
	} else {
		throw new Error('Unexpected non-identifier on the arrow function.')
	}
}

/**
 * Process nesting when declared an object literal.
 */
function processObjectLiteral(
	c: ts.ObjectLiteralExpression,
	parents: string[],
	sf: ts.SourceFile,
	im: ImportMap,
	currentDirectory: string,
	currentDepth: number,
): ValueNode[] {
	let nodes: ValueNode[] = []
	c.properties.forEach((x) => {
		if (ts.isPropertyAssignment(x)) {
			const made = propAss(x, parents, sf, im, currentDirectory, currentDepth)
			nodes.push(made)
		} else {
			throw new Error('Nested object must lead into property assignment.')
		}
	})
	return nodes
}

/**
 * Get comment above the current node.
 */
function getComment(node: ts.Node, sf: ts.SourceFile): string | undefined {
	const docs = utils.getJsDoc(node, sf)
	if (docs.length > 0) {
		return docs[0].comment ?? undefined
	}
	return undefined
}
