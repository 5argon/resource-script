import { parseFile } from './parse'
import { astToJSON } from './to-json'
import fs from 'fs'
import path from 'path'
import yargs from 'yargs'

function changeExtension(file: string, extension: string) {
	const basename = path.basename(file, path.extname(file))
	return path.join(path.dirname(file), basename + extension)
}

type CommentMode = 'object' | 'deep' | 'forced-deep'
const commentModes: ReadonlyArray<CommentMode> = ['object', 'deep', 'forced-deep']

const argv = yargs(process.argv.slice(2))
	.scriptName('resource-script')
	.demandCommand()
	.command(
		'to-json',
		'Converts Resource Script files into JSON files.',
		(yargs) => {
			return yargs.options({
				c: {
					choices: commentModes,
					alias: 'comment',
					description:
						'How the Resource Script comments translates to JSON. (object, deep, or forced-deep)',
					type: 'string',
				},
			})
		},
		(argv) => {
			if (argv._.length < 2) {
				console.error('Must provide one or more Resource Script file.')
				return
			}

			argv._.slice(1).forEach((x) => {
				if (typeof x === 'string') {
					const cm = argv.c as CommentMode
					const json = astToJSON(parseFile(x), cm)
					fs.writeFileSync(changeExtension(x, '.json'), json)
				}
			})

			console.log('Finished converting Resource Script file(s) to JSON.')
		},
	).argv
