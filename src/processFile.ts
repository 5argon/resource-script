import * as ts from 'typescript'
import * as utils from 'tsutils'
import {
	Params,
	Ast,
	Group,
	TreeItem,
	NoParams,
	WithParams,
	Token,
	FunctionTokenParam,
} from './interface'
import path from 'path'

type ImportMap = { [k: string]: string }
/**
 * Called on the first entry and also when traversing into new imports.
 */
export function processFile(filePath: string, parents: string[]): Ast | null {
	const program = ts.createProgram({ rootNames: [filePath], options: {} })
	const sf = program.getSourceFile(filePath)
	if (sf === undefined) {
		return null
	}

	let comment: string | undefined = undefined
	let name: string = ''
	let nodes: TreeItem[] = []
	let im: ImportMap = {}
	let newParent: string[] = [...parents]
	const dir = path.dirname(filePath)

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
				if (ts.isIdentifier(dec.name)) {
					name = dec.name.text
					newParent.push(name)
				}
				if (dec.initializer) {
					if (ts.isObjectLiteralExpression(dec.initializer)) {
						nodes = processObjectLiteral(dec.initializer, newParent, sf, im, dir)
					}
				}
			}
		}
		// Silently pass all other top level declarations.
		// User can declare other helpers creatively.
	})
	const ast: Ast = { nodes: nodes, comment: comment, keys: newParent }
	return ast
}

/**
 * Main loop that supports 4 kinds of `PropertyAssignment` :
 * - object (nesting)
 * - identifier (imports)
 * - string
 * - arrow function
 */
function propAss(
	c: ts.PropertyAssignment,
	parents: string[],
	sf: ts.SourceFile,
	im: ImportMap,
	currentDirectory: string,
): TreeItem {
	const newParents = [...parents]
	const name: string = ts.isIdentifier(c.name) ? c.name.text : ''
	const comment = getComment(c, sf)
	newParents.push(name)
	const initializer = c.initializer
	if (ts.isObjectLiteralExpression(initializer)) {
		const nodes = processObjectLiteral(initializer, newParents, sf, im, currentDirectory)
		const ret: Group = {
			comment: comment,
			nodes: nodes,
			keys: newParents,
		}
		return ret
	}
	if (ts.isIdentifier(initializer)) {
		const importName = initializer.text
		if (importName in im) {
			const p = path.join(currentDirectory, im[importName] + '.ts')
			const ast = processFile(p, newParents)
			if (ast !== null) {
				const ret: Group = {
					comment: ast.comment,
					keys: ast.keys,
					nodes: ast.nodes,
				}
				return ret
			} else {
				throw new Error('Failed resolving to path ' + p)
			}
		}
	}
	if (ts.isStringLiteral(initializer)) {
		const ret: NoParams = {
			comment: comment,
			keys: newParents,
			text: initializer.text,
		}
		return ret
	}
	if (ts.isArrowFunction(initializer)) {
		const args: Params[] = initializer.parameters.map<Params>((x) => {
			return parseArrowFunctionParams(x)
		})

		const body = initializer.body
		const tokens: Token[] = []
		if (ts.isTemplateExpression(body)) {
			tokens.push(...processTemplateExpression(body))
		}
		const ret: WithParams = {
			comment: comment,
			keys: newParents,
			params: args,
			tokens: tokens,
		}
		return ret
	}
	throw new Error(
		"The right side of object's key must be either : object (nesting), string literal, identifier (imports), arrow function.",
	)
}

/**
 * Turn template expression into full string.
 * `abc ${de} fgh` -> "abc {de} fgh"
 * If function call found, supports 3 kinds of args : identifier, enums, number.
 */
function processTemplateExpression(t: ts.TemplateExpression): Token[] {
	const collect: Token[] = []
	if (t.head.text !== '') {
		collect.push({ text: t.head.text })
	}
	t.templateSpans.forEach((x) => {
		if (ts.isIdentifier(x.expression)) {
			collect.push({ paramName: x.expression.text })
		}
		if (ts.isCallExpression(x.expression)) {
			const lhs = x.expression.expression
			let funcName = ''
			if (ts.isIdentifier(lhs)) {
				funcName = lhs.text
			}
			const ffp = x.expression.arguments.map<FunctionTokenParam>((x) => {
				if (ts.isIdentifier(x)) {
					return {
						content: x.text,
						type: 'string',
					}
				}
				if (ts.isPropertyAccessExpression(x)) {
					const iden: string = ts.isIdentifier(x.name)
						? x.name.text
						: ts.isPrivateIdentifier(x.name)
						? x.name.text
						: ''
					return {
						content: iden,
						type: 'enum',
					}
				}
				if (ts.isNumericLiteral(x)) {
					return {
						content: parseInt(x.text, 10),
						type: 'number',
					}
				}
				throw new Error(
					'When using functions inside template literal, its arguments must be either : identifier, enums, or number.',
				)
			})
			collect.push({ functionName: funcName, params: ffp })
		}
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
		if (
			ts.isTypeReferenceNode(t) &&
			ts.isIdentifier(t.typeName) &&
			t.typeName.text === 'Date'
		) {
			const par: Params = {
				text: name,
				type: 'date',
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
			default: {
				throw new Error(
					"Arrow function's parameter must be of type : string, number, or Date.",
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
): TreeItem[] {
	let nodes: TreeItem[] = []
	c.properties.forEach((x) => {
		if (ts.isPropertyAssignment(x)) {
			const made = propAss(x, parents, sf, im, currentDirectory)
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
