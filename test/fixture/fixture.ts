import linked from './fixture-sub'

enum En {
	En1,
	En2,
}
function LitFunc(arg: string, en: En, count: number) {}

/** comment 0 */
const outer = {
	/** comment 1.1 */
	level11: {
		/** comment 2.1 */
		level21: linked,
		/** comment 2.2 */
		level22: 'level22-string',
		/** comment 2.3 */
		level23: (firstArg: number) => `${firstArg} span string 1`,
		/** comment 2.4 */
		level24: (firstArg: string, secondArg: string) =>
			`${firstArg} span string 1 ${secondArg} span string 2`,
		/** comment 2.5 */
		level25: (firstArg: string, secondArg: string) =>
			`span string 1 ${LitFunc(firstArg, En.En1, 10)} span string 2 ${LitFunc(
				secondArg,
				En.En2,
				20,
			)}`,
	},
	/** comment 1.2 */
	level12: 'level12-string',
	/** comment 1.3 */
	level13: 5555,
	/** comment 1.4 */
	level14: ['string1', 'string2', 'string3'],
	/** comment 1.5 */
	level15: [111, 222, 333],
	/** comment 1.6 */
	level16: 'level16-string',
}

export default outer
