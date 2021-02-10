import * as ts from 'typescript'
import * as utils from 'tsutils'
import { Arg, Ast, Group, NodeType, Simple, WithArgs } from './interface'

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
	let nodes: NodeType[] = []
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
function propAss(c: ts.PropertyAssignment, parents: string[], sf: ts.SourceFile): NodeType | null {
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
		const ret: Simple = {
			comment: comment,
			name: newParents,
			value: initializer.text,
		}
		return ret
	}
	if (ts.isArrowFunction(initializer)) {
		const args: Arg[] = initializer.parameters.map<Arg>((x) => {
			return parseArrowFunctionParams(x)
		})

		const body = initializer.body
		let value: string = ''
		if (ts.isTemplateExpression(body)) {
			value = processTemplateExpression(body)
		}
		const ret: WithArgs = {
			comment: comment,
			name: newParents,
			args: args,
			value: value,
		}
		return ret
	}
	return null
}

/**
 * Turn template expression into full string.
 * `abc ${de} fgh` -> "abc {de} fgh"
 */
function processTemplateExpression(t: ts.TemplateExpression): string {
	const collect: string[] = []
	collect.push(t.head.text)
	t.templateSpans.forEach((x) => {
		if (ts.isIdentifier(x.expression)) {
			collect.push('{' + x.expression.text + '}')
		}
		collect.push(x.literal.text)
	})
	return collect.join()
}

/**
 * Maps arrow function params into supported type token in the AST.
 */
function parseArrowFunctionParams(x: ts.ParameterDeclaration): Arg {
	const name: string = ts.isIdentifier(x.name) ? x.name.text : '???'
	const t = x.type
	if (!t) {
		const par: Arg = {
			name: name,
			type: 'unsupported',
		}
		return par
	}
	if (ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName) && t.typeName.text === 'Date') {
		const par: Arg = {
			name: name,
			type: 'date',
		}
		return par
	}
	switch (t.kind) {
		case ts.SyntaxKind.NumberKeyword: {
			const par: Arg = {
				name: name,
				type: 'number',
			}
			return par
		}
		case ts.SyntaxKind.StringKeyword: {
			const par: Arg = {
				name: name,
				type: 'string',
			}
			return par
		}
		default: {
			const par: Arg = {
				name: name,
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
): NodeType[] {
	let nodes: NodeType[] = []
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
