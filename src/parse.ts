import { Ast } from './interface'
import { processFile } from './processFile'

export function parse(files: string): Ast | undefined {
	return processFile(files, []) ?? undefined
}
