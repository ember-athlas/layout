import { scheduleOnce } from '@ember/runloop';
import layout from '../templates/components/tab-layout';
import PageLayout from './page-layout';
import AthlasLayoutService from '@ember-athlas/layout/services/athlas-layout';
import { service } from '@ember-decorators/service';
import { classNames, className } from '@ember-decorators/component';
import { computed, action } from '@ember-decorators/object';

@classNames('layout-tab')
export default class TabLayout extends PageLayout {
	layout = layout;
	@service('athlas-layout') athlas!: AthlasLayoutService;

	// args
	@className position: string = this.position || this.athlas.tabPosition;
	fill: boolean = this.fill || this.athlas.tabFill;
	justified: boolean = this.justified || this.athlas.tabJustified;
	shape: string = this.shape || this.athlas.tabShape;

	barClass: string = this.barClass || '';
	containerClass: string = this.containerClass || '';


	// props
	@computed('position')
	get top(): boolean {
		return this.position === 'top';
	}

	@computed('position')
	get bottom(): boolean {
		return this.position === 'bottom';
	}

	didInsertElement() {
		super.didInsertElement();

		scheduleOnce('afterRender', this, () => {
			this.rerender();
		});
	}

	@action
	changePage(name: string) {
		this.set('page', name);
	}
}
