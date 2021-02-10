import linked from './fixture-sub'

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
	},
	/** comment 1.2 */
	level12: 'Level12-string',
}

export default outer
