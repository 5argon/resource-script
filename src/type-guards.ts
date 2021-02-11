import {
  Value,
  Group,
  Text,
  TextTemplated,
  Numeric,
  TextArray,
  NumericArray,
  Bool,
  BoolArray,
  NamedTuple,
  CustomType,
  SupportedType,
} from './interface'

export function isGroup(bn: Value): bn is Group {
  return 'children' in bn
}
export function isText(bn: Value): bn is Text {
  return 'text' in bn
}
export function isTextArray(bn: Value): bn is TextArray {
  return 'texts' in bn
}
export function isNumeric(bn: Value): bn is Numeric {
  return 'value' in bn
}
export function isNumericArray(bn: Value): bn is NumericArray {
  return 'values' in bn
}
export function isBool(bn: Value): bn is Bool {
  return 'bool' in bn
}
export function isBoolArray(bn: Value): bn is BoolArray {
  return 'bools' in bn
}
export function isTextTemplated(bn: Value): bn is TextTemplated {
  return 'params' in bn && 'tokens' in bn
}
export function isNamedTuple(bn: Value): bn is NamedTuple {
  return 'tupleName' in bn && 'params' in bn
}
export function isCustomType(st: SupportedType): st is CustomType {
  if (st !== 'string' && st !== 'number' && st !== 'boolean') {
    return true
  }
  return false
}
