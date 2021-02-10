import { Ast } from './interface'
import { processFile } from './processFile'

/**
 * If the file is not found or malformed, returns `undefined`.
 */
export function parse(files: string): Ast | undefined {
	return processFile(files, []) ?? undefined
}
