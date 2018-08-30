import { className, classNames, tagName } from '@ember-decorators/component';
import { computed } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';
import Component from '@ember/component';
import TabLayout from '../tab-layout';
import layout from '../../templates/components/tab-layout/tabbar';

const shapeClasses: any = {
	'tabs': 'nav-tabs',
	'pills': 'nav-pills',
	'underlined': 'shape-underlined'
};

@tagName('ul')
@classNames('layout-tab-tabbar', 'nav')
export default class Tabbar extends Component {
	layout = layout;

	container!: TabLayout;

	@className('nav-fill')
	@alias('container.fill') fill!: boolean;

	@className('nav-justified')
	@alias('container.justified') justified!: boolean;

	@className
	@alias('container.barClass')
	barClass!: string;

	@className
	@computed('container.shape')
	get shape(): string {
		if (shapeClasses.hasOwnProperty(this.container.shape)) {
			return shapeClasses[this.container.shape] as string;
		}

		return '';
	}
}
