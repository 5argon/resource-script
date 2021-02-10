import { createIntl, createIntlCache, IntlShape } from 'react-intl'

export default class TextResource {
	private intl: IntlShape
	get home() {
		return {
			/** Title text */
			title: this.intl.formatMessage({
				id: 'home.title',
				description: 'Title text',
				defaultMessage: 'Title',
			}),

			/** Description text */
			description: this.intl.formatMessage({
				id: 'home.description',
				description: 'Description text',
				defaultMessage: 'Description',
			}),

			/** Days left until release date */
			daysLeft: (days: number) =>
				this.intl.formatMessage(
					{
						id: 'home.daysLeft',
						description: 'Days left until release date',
						defaultMessage: 'Days Left : {days}',
					},
					{ days: days },
				),

			/** Visitor name */
			yourNameIs: (name: string) =>
				this.intl.formatMessage(
					{
						id: 'home.yourNameIs',
						description: 'Visitor name',
						defaultMessage: 'Your Name Is : {name}',
					},
					{ name: name },
				),
		}
	}
}
