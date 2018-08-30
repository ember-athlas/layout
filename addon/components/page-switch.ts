import { attribute, classNames } from '@ember-decorators/component';
import { action } from '@ember-decorators/object';
import Component from '@ember/component';
import layout from '../templates/components/page-switch';

/**
 * The page switch component is an easy switch button to change the page of a page layout.
 *
 * ```hbs
 * <PageSwitch @page={{activePage}} @pageChanged={{action 'changePage'}} as |switch|>
 *	<switch.button @value='rocket'><i class="fa fa-rocket"></i></switch.button>
 *	<switch.button @value='jet'><i class="fa fa-jet"></i></switch.button>
 * </PageSwitch>
 * ```
 *
 * @yield {Object} switch - The yielded API hash
 * @yield {Button} switch.button - Button component
 */
@classNames('btn-group')
export default class PageSwitch extends Component {
	/** @hidden */
	layout = layout;

	// attributes

	/** @hidden */
	@attribute role: string = 'group';

	// arguments

	/**
	 * Is the active page, relates to the `name` argument of each page.
	 * @argument
	 */
	page: string = this.page || '';

	/**
	 * Is a page required at all or can it be null to display no page at all?
	 * @argument
	 */
	required: boolean = true;

	@action
	changePage(key: string) {
		key = !this.required && key === this.page ? '' : key;
		this.trigger('pageChanged', key);
	}
}
