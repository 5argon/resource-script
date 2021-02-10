import { Ast } from './interface'
import { processFile } from './processFile'

/**
 * Throw if the file is not found or malformed.
 */
export function parse(files: string): Ast {
	return processFile(files, [], 0)
}