import { Ast } from './interface'
import { processFile, processString } from './processFile'

/**
 * Throw if the file is not found or malformed.
 */
export function parseFile(files: string): Ast {
	return processFile(files, [], 0)
}

/**
 * Ignores any import statement.
 */
export function parseString(s: string): Ast {
	return processString(s)
}
