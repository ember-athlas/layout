import AthlasLayoutService from '@ember-athlas/layout/services/athlas-layout';
import { attribute, className, classNames, tagName } from '@ember-decorators/component';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import Component from '@ember/component';
import layout from '../../templates/components/page-switch/button';

/**
 * A button for a page switch
 *
 * ```hbs
 * <PageSwitch @page={{activePage}} @pageChanged={{action 'changePage'}} as |switch|>
 *	<switch.button @value='rocket'><i class="fa fa-rocket"></i></switch.button>
 * </PageSwitch>
 * ```
 */
@tagName('button')
@classNames('btn', 'btn-sm')
export default class PageSwitchButton extends Component {
	/** @hidden */
	layout = layout;

	/** @hidden */
	@service('athlas-layout') athlas!: AthlasLayoutService;

	// args

	/** @hidden */
	page!: string;

	/**
	 * When the button is pressed, this value is sent to `pageChanged` event of `<PageSwitch>`
	 * @argument
	 */
	value!: string;

	/**
	 * The css class for the button
	 * @argument
	 */
	@className btnClass: string = this.btnClass || this.athlas.pageSwitchBtnClass;

	/**
	 * A title for the button
	 * @argument
	 */
	@attribute title: string = '';

	/**
	 * Tells whether this button is active
	 */
	@className('active')
	@computed('page')
	get active(): boolean {
		return this.page === this.value;
	};

	/** @hidden */
	click() {
		this.trigger('changePage', this.value);
	}
}
