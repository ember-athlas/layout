import Page from '@ember-athlas/layout/components/page-layout/page';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import layout from '../templates/components/page-layout';
import { A } from '@ember/array';
import MutableArray from '@ember/array/mutable';

/**
 * A page layout is designed to show one out of many pages.
 *
 * ```hbs
 * <PageLayout as |layout|>
 * 	<layout.page @name='rocket'>
 * 		... Rocket contents go here ...
 * 	</layout.page>
 * 	<layout.page @name='jet'>
 * 		... Jet contents go here ...
 * 	</layout.page>
 * </PageLayout>
 * ```
 *
 * @yield {Object} layout - The yielded API hash
 * @yield {Page} layout.page - Page component
 */
@classNames('layout-pages')
export default class PageLayout extends Component {
	/** @hidden */
	layout = layout;

	/**
	 * Is the active page, relates to the name attribute of each page.
	 * @argument
	 */
	page?: string;

	pages: Page[] = [];

	constructor() {
		super(...arguments);
		this.addObserver('page', () => {
			this.activatePage(this.page!);
		});
	}

	/** @hidden */
	registerPage(page: Page) {
		this.pages.pushObject(page);
		page.on('didInsertElement', () => {
			this.activatePage(this.page!);
		});

		if (this.page === null) {
			this.set('page', page.name);
		}
	}

	/**
	 *
	 * @param name the name of the page to activate
	 */
	activatePage(name: string) {
		for (let page of this.pages) {
			const element = page.element;
			if (element) {
				const classes = element.classList;

				if (page.name === name) {
					classes.remove('layout-page-deactive');
					classes.add('layout-page-active');
				} else {
					classes.remove('layout-page-active');
					classes.add('layout-page-deactive');
				}
			}
		}
	}
}
