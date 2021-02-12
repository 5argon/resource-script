import { BaseNode } from './interface'

/**
 * If the keys leading into the object are `a` `b` `c`, get just `c`.
 */
export function getRealKey(bn: BaseNode): string {
  return bn.keys[bn.keys.length - 1]
}

/**
 * If the keys leading into the object are `a` `b` `c`,
 * get `a.b.c` with no `separator` provided or provide any other `separator` of your choice.
 */
export function getConcatenatedKey(
  bn: BaseNode,
  separator?: string | undefined,
): string {
  return bn.keys.join(separator ?? '.')
}
