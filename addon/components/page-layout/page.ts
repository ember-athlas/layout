import PageLayout from '@ember-athlas/layout/components/page-layout';
import { classNames } from '@ember-decorators/component';
import { computed } from '@ember-decorators/object';
import Component from '@ember/component';
import layout from '../../templates/components/page-layout/page';

// dec2hex :: Integer -> String
function dec2hex(dec: number): string {
	return ('0' + dec.toString(16)).substr(-2)
}

// generateId :: Integer -> String
function generateId(len: number = 40): string {
	var arr = new Uint8Array(len / 2)
	window.crypto.getRandomValues(arr)
	return Array.from(arr, dec2hex).join('')
}

/**
 * A page for a page layout.
 *
 * ```hbs
 * <PageLayout as |layout|>
 * 	<layout.page @name='rocket'>
 * 		... Rocket contents go here ...
 * 	</layout.page>
 * </PageLayout>
 * ```
 */
@classNames('layout-page')
export default class PageLayoutPage extends Component {
	/** @hidden */
	layout = layout;

	/**
	 * Unique name for the page.
	 * @argument
	 */
	name: string = this.name ||  generateId();

	/** @hidden */
	container!: PageLayout;


	/**
	 * Tells whether this is the active page
	 */
	@computed('container.page')
	get isActive(): boolean {
		return this.container.page === this.name;
	}

	constructor() {
		super(...arguments);

		this.container.registerPage(this);
	}
}
