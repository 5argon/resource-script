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
	FakeFuncParam,
} from './interface'

/**
 * Called on the first entry and also when traversing into new imports.
 */
export function processFile(file: string, parents: string[]): Ast | null {
	const program = ts.createProgram({ rootNames: [file], options: {} })
	const sf = program.getSourceFile(file)
	if (sf === undefined) {
		return null
	}

	let comment: string | undefined = undefined
	let name: string = ''
	let nodes: TreeItem[] = []
	let importMap: { [k: string]: string } = {}
	let newParent: string[] = [...parents]

	ts.forEachChild(sf, (node) => {
		if (ts.isImportDeclaration(node)) {
			const ic = node.importClause
			const ms = node.moduleSpecifier
			if (ic !== undefined && ic.name !== undefined && ts.isStringLiteral(ms)) {
				importMap[ic.name.escapedText.toString()] = ms.text
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
						nodes = processObjectLiteral(dec.initializer, newParent, sf)
					}
				}
			}
		}
	})
	const ast: Ast = { nodes: nodes, comment: comment, name: newParent }
	return ast
}

/**
 * Main loop that supports 4 kinds of `PropertyAssignment` :
 * - object (nesting)
 * - identifier (imports)
 * - string
 * - arrow function
 */
function propAss(c: ts.PropertyAssignment, parents: string[], sf: ts.SourceFile): TreeItem | null {
	const newParents = [...parents]
	const name: string = ts.isIdentifier(c.name) ? c.name.text : ''
	const comment = getComment(c, sf)
	newParents.push(name)
	const initializer = c.initializer
	if (ts.isObjectLiteralExpression(initializer)) {
		const nodes = processObjectLiteral(initializer, newParents, sf)
		const ret: Group = {
			comment: comment,
			nodes: nodes,
			name: newParents,
		}
		return ret
	}
	if (ts.isIdentifier(initializer)) {
	}
	if (ts.isStringLiteral(initializer)) {
		const ret: NoParams = {
			comment: comment,
			name: newParents,
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
			name: newParents,
			params: args,
			tokens: tokens,
		}
		return ret
	}
	return null
}

/**
 * Turn template expression into full string.
 * `abc ${de} fgh` -> "abc {de} fgh"
 * If function call found, supports 3 kinds of args : identifier, enums, number.
 */
function processTemplateExpression(t: ts.TemplateExpression): Token[] {
	const collect: Token[] = []
	collect.push(t.head.text)
	t.templateSpans.forEach((x) => {
		if (ts.isIdentifier(x.expression)) {
			collect.push('{' + x.expression.text + '}')
		}
		if (ts.isCallExpression(x.expression)) {
			const lhs = x.expression.expression
			let funcName = ''
			if (ts.isIdentifier(lhs)) {
				funcName = lhs.text
			}
			const ffp = x.expression.arguments.map<FakeFuncParam>((x) => {
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
				return {
					content: '',
					type: 'unsupported',
				}
			})
			collect.push({ functionName: funcName, params: ffp })
		}
		collect.push(x.literal.text)
	})
	return collect
}

/**
 * Maps arrow function params into supported type token in the AST.
 */
function parseArrowFunctionParams(x: ts.ParameterDeclaration): Params {
	const name: string = ts.isIdentifier(x.name) ? x.name.text : '???'
	const t = x.type
	if (!t) {
		const par: Params = {
			text: name,
			type: 'unsupported',
		}
		return par
	}
	if (ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName) && t.typeName.text === 'Date') {
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
			const par: Params = {
				text: name,
				type: 'unsupported',
			}
			return par
		}
	}
}

/**
 * Process nesting when declared an object literal.
 */
function processObjectLiteral(
	c: ts.ObjectLiteralExpression,
	parents: string[],
	sf: ts.SourceFile,
): TreeItem[] {
	let nodes: TreeItem[] = []
	c.properties.forEach((x) => {
		if (ts.isPropertyAssignment(x)) {
			const made = propAss(x, parents, sf)
			if (made !== null) {
				nodes.push(made)
			}
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
