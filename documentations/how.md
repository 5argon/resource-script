# How

It take an array of input `.ts` files. Each file got processed individually, it doesn't support module importing. It uses the [compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) of `typescript` package to travel the AST then print it differently.