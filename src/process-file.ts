import * as ts from 'typescript'
import * as utils from 'tsutils'
import {
  Params,
  Ast,
  Group,
  ValueNode,
  Text,
  TextTemplated,
  TemplateSpan,
  Numeric,
  TextArray,
  NumericArray,
  Bool,
  BoolArray,
  NamedTupleParam,
  Value,
  NamedTuple,
  Tag,
} from './interface'
import path from 'path'
import { NodeArray } from 'typescript'

type ImportMap = { [k: string]: string }

export function processString(fileContent: string): Ast {
  const sf = ts.createSourceFile(
    'dummy.rs.ts',
    fileContent,
    ts.ScriptTarget.ES2020,
  )
  return process([], 0, sf, '')
}

/**
 * Called on the first entry and also when traversing into new imports.
 */
export function processFile(
  filePath: string,
  parents: string[],
  depth: number,
): Ast {
  const program = ts.createProgram({ rootNames: [filePath], options: {} })
  const sf = program.getSourceFile(filePath)
  if (sf === undefined) {
    throw new Error('File not found at ' + filePath)
  }
  const dir = path.dirname(filePath)
  return process(parents, depth, sf, dir)
}

export function process(
  parents: string[],
  depth: number,
  sf: ts.SourceFile,
  dir: string,
): Ast {
  let comment: string | undefined = undefined
  let tags: Tag[] = []
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
      const ct = getCommentAndTags(node, sf)
      comment = ct.comment
      tags = ct.tags
      const decs = node.declarationList.declarations
      if (decs.length > 0) {
        const dec = decs[0]
        if (ts.isIdentifier(dec.name) && depth === 0) {
          name = dec.name.text
          newParent.push(name)
        }
        if (dec.initializer) {
          if (ts.isObjectLiteralExpression(dec.initializer)) {
            nodes = processObjectLiteral(
              dec.initializer,
              newParent,
              sf,
              im,
              dir,
              depth,
            )
          }
        }
      }
    }
    // Silently pass all other top level declarations.
    // User can declare other helpers creatively.
  })
  const ast: Ast = {
    children: nodes,
    comment: comment,
    keys: newParent,
    tags: tags,
  }
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
  const ct = getCommentAndTags(c, sf)
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
  return { ...sup, comment: ct.comment, keys: newParents, tags: ct.tags }
}

function processExpression(
  exp: ts.Expression,
  parents: string[],
  sf: ts.SourceFile,
  im: ImportMap,
  dir: string,
  depth: number,
  identifierAsImports: boolean,
): Value {
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
      if (identName in im && dir !== '') {
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
        } else if (ts.isPropertyAccessExpression(x)) {
          const iden: string = ts.isIdentifier(x.name)
            ? x.name.text
            : ts.isPrivateIdentifier(x.name)
            ? x.name.text
            : ''
          collect.push(iden)
        } else {
          throw new Error('String array must be entirely of the same type.')
        }
      })
      const ret: TextArray = {
        texts: collect,
      }
      return ret
    } else if (ts.isPropertyAccessExpression(firstElement)) {
      // Support enums in the array.
      const collect: string[] = []
      exp.elements.forEach((x) => {
        if (ts.isStringLiteral(x)) {
          collect.push(x.text)
        } else if (ts.isPropertyAccessExpression(x)) {
          const iden: string = ts.isIdentifier(x.name)
            ? x.name.text
            : ts.isPrivateIdentifier(x.name)
            ? x.name.text
            : ''
          collect.push(iden)
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
        if (x.kind === ts.SyntaxKind.TrueKeyword) {
          collect.push(true)
        } else if (x.kind === ts.SyntaxKind.FalseKeyword) {
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
      throw new Error(
        'Array value must be all strings, numbers, or booleans (same type).',
      )
    }
  }
  // Arrow function as templated string
  if (ts.isArrowFunction(exp)) {
    const args: Params[] = exp.parameters.map<Params>((x) => {
      return parseArrowFunctionParams(x)
    })
    const body = exp.body
    const tokens: TemplateSpan[] = []
    if (ts.isTemplateExpression(body)) {
      tokens.push(
        ...processTemplateExpression(body, parents, sf, im, dir, depth),
      )
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
      return processExpression(x, parents, sf, im, dir, depth, false)
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
): TemplateSpan[] {
  const collect: TemplateSpan[] = []
  if (t.head.text !== '') {
    collect.push(t.head.text)
  }
  t.templateSpans.forEach((x) => {
    const sup = processExpression(
      x.expression,
      parents,
      sf,
      im,
      dir,
      depth,
      false,
    )
    collect.push(sup)
    // The remaining string of this span
    if (x.literal.text !== '') {
      collect.push(x.literal.text)
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

interface CommentAndTags {
  comment: string | undefined
  tags: Tag[]
}

/**
 * Get comment above the current node.
 */
function getCommentAndTags(node: ts.Node, sf: ts.SourceFile): CommentAndTags {
  const docs = utils.getJsDoc(node, sf)
  let commentRaw: string | undefined
  if (docs.length === 0) {
    return { comment: undefined, tags: [] }
  }
  commentRaw = docs[0].comment
  return {
    comment: commentRaw,
    tags: docs[0].tags ? processTags(docs[0].tags) : [],
  }
}

function processTags(c: NodeArray<ts.JSDocTag>): Tag[] {
  function processSee2(s: undefined | string): undefined | string | number {
    if (s === undefined) {
      return undefined
    }
    const spaceSplit = s.split(' ')
    if (s.length === 0 || spaceSplit.length === 0) {
      return undefined
    }
    // * fix weird bug where there is nothing following the tag and it take
    // "*" from the next line as its tag.
    if (spaceSplit.length === 1) {
      const parsed = Number.parseFloat(spaceSplit[0])
      if (isNaN(parsed)) {
        return spaceSplit[0] === '*' ? undefined : spaceSplit[0]
      } else {
        return parsed
      }
    }
    return s === '*' ? undefined : s
  }

  const tags: Tag[] = c
    .map<Tag>((x) => {
      const hackText: string = (x as any).name.name.text
      const t: Tag = { tagName: hackText, value: processSee2(x.comment) }
      return t
    })
    .filter((x) => x.tagName !== '')
  return tags
}
